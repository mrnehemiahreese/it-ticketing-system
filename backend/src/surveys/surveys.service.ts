import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SurveyResponse } from './entities/survey-response.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { CreateSurveyResponseInput } from './dto/create-survey-response.dto';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(SurveyResponse)
    private surveyResponseRepository: Repository<SurveyResponse>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async create(input: CreateSurveyResponseInput, user: User): Promise<SurveyResponse> {
    // Check if ticket exists
    const ticket = await this.ticketRepository.findOne({
      where: { id: input.ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Only allow survey on resolved or closed tickets
    if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) {
      throw new ForbiddenException('Can only submit survey for resolved or closed tickets');
    }

    // Only the ticket creator can submit a survey
    if (ticket.createdById !== user.id) {
      throw new ForbiddenException('Only the ticket creator can submit a survey');
    }

    // Check if survey already exists
    const existingSurvey = await this.surveyResponseRepository.findOne({
      where: {
        ticketId: input.ticketId,
        userId: user.id,
      },
    });

    if (existingSurvey) {
      throw new ConflictException('Survey already submitted for this ticket');
    }

    // Create survey response
    const surveyResponse = this.surveyResponseRepository.create({
      ticketId: input.ticketId,
      userId: user.id,
      rating: input.rating,
      feedback: input.feedback,
    });

    return this.surveyResponseRepository.save(surveyResponse);
  }

  async findByTicket(ticketId: string): Promise<SurveyResponse | null> {
    return this.surveyResponseRepository.findOne({
      where: { ticketId },
    });
  }

  async getAverageRating(startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.surveyResponseRepository.createQueryBuilder('survey');

    if (startDate && endDate) {
      query.where('survey.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.where('survey.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      query.where('survey.createdAt <= :endDate', { endDate });
    }

    const result = await query.select('AVG(survey.rating)', 'average').getRawOne();

    return result.average ? parseFloat(result.average) : 0;
  }

  async getRatingDistribution(): Promise<Record<number, number>> {
    const results = await this.surveyResponseRepository
      .createQueryBuilder('survey')
      .select('survey.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .groupBy('survey.rating')
      .getRawMany();

    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    results.forEach((result) => {
      distribution[result.rating] = parseInt(result.count);
    });

    return distribution;
  }
}
