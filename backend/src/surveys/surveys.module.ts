import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { SurveysResolver } from './surveys.resolver';
import { SurveyResponse } from './entities/survey-response.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyResponse, Ticket])],
  providers: [SurveysService, SurveysResolver],
  exports: [SurveysService],
})
export class SurveysModule {}
