import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { SlackService } from '../slack/slack.service';
import { sanitizeContent } from '../common/utils/sanitize';
import { EmailService } from '../notifications/email.service';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private slackService: SlackService,
    private emailService: EmailService,
  ) {}

  async create(createCommentInput: CreateCommentInput, userId: string): Promise<Comment> {
    // Security: Sanitize comment content to prevent XSS
    const sanitizedInput = {
      ...createCommentInput,
      content: sanitizeContent(createCommentInput.content),
    };

    const comment = this.commentsRepository.create({
      ...sanitizedInput,
      userId,
    });

    const savedComment = await this.commentsRepository.save(comment);
    const fullComment = await this.findOne(savedComment.id);
    
    // Notify Slack about new comment
    await this.slackService.notifyCommentAdded(fullComment).catch(err => {
      console.error('Failed to notify Slack of comment:', err);
    });

    // Send email notification for public comments
    if (!fullComment.isInternal && fullComment.ticket) {
      const ticket = await this.ticketsRepository.findOne({
        where: { id: fullComment.ticket.id },
        relations: ['createdBy', 'assignedTo'],
      });
      if (ticket && ticket.createdBy) {
        const commenterName = fullComment.user?.fullname || 'Support Team';
        await this.emailService.sendCommentNotification(
          ticket,
          ticket.createdBy,
          fullComment.content,
          commenterName,
        ).catch(err => {
          console.error('Failed to send comment email notification:', err);
        });
      }
    }
    
    return fullComment;
  }

  async findAll(): Promise<Comment[]> {
    return this.commentsRepository.find({
      relations: ['user', 'ticket'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTicket(ticketId: string, user: User): Promise<Comment[]> {
    const query = this.commentsRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.ticketId = :ticketId', { ticketId })
      .orderBy('comment.createdAt', 'ASC');

    // Non-agents can't see internal comments
    if (!user.roles.includes(Role.ADMIN) && !user.roles.includes(Role.AGENT)) {
      query.andWhere('comment.isInternal = :isInternal', { isInternal: false });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'ticket'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: string, updateCommentInput: UpdateCommentInput, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    // Only the comment author or admins can update
    if (comment.userId !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You do not have permission to update this comment');
    }

    // Security: Sanitize content if being updated
    if (updateCommentInput.content) {
      updateCommentInput.content = sanitizeContent(updateCommentInput.content);
    }

    Object.assign(comment, updateCommentInput);
    const savedComment = await this.commentsRepository.save(comment);
    return this.findOne(savedComment.id);
  }

  async remove(id: string, user: User): Promise<boolean> {
    const comment = await this.findOne(id);

    // Only the comment author or admins can delete
    if (comment.userId !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.commentsRepository.remove(comment);
    return true;
  }
}
