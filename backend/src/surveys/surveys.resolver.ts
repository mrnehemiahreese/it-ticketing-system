import { Resolver, Mutation, Query, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveyResponse } from './entities/survey-response.entity';
import { CreateSurveyResponseInput } from './dto/create-survey-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { GraphQLISODateTime } from '@nestjs/graphql';

@Resolver(() => SurveyResponse)
@UseGuards(JwtAuthGuard)
export class SurveysResolver {
  constructor(private readonly surveysService: SurveysService) {}

  @Mutation(() => SurveyResponse)
  async submitSurvey(
    @Args('input') input: CreateSurveyResponseInput,
    @CurrentUser() user: User,
  ): Promise<SurveyResponse> {
    return this.surveysService.create(input, user);
  }

  @Query(() => SurveyResponse, { nullable: true, name: 'ticketSurvey' })
  async getTicketSurvey(
    @Args('ticketId', { type: () => ID }) ticketId: string,
  ): Promise<SurveyResponse | null> {
    return this.surveysService.findByTicket(ticketId);
  }

  @Query(() => Float, { name: 'averageRating' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  async getAverageRating(
    @Args('startDate', { type: () => GraphQLISODateTime, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => GraphQLISODateTime, nullable: true }) endDate?: Date,
  ): Promise<number> {
    return this.surveysService.getAverageRating(startDate, endDate);
  }
}
