import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

// Module imports
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SlackModule } from './slack/slack.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { PortalModule } from './portal/portal.module';
import { SurveysModule } from './surveys/surveys.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { SlaModule } from './sla/sla.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';

// Entity imports
import { User } from './users/entities/user.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { TicketWatcher } from './tickets/entities/ticket-watcher.entity';
import { Comment } from './comments/entities/comment.entity';
import { Attachment } from './attachments/entities/attachment.entity';
import { KnowledgeArticle } from './database/entities/knowledge-article.entity';
import { SurveyResponse } from './surveys/entities/survey-response.entity';
import { SlaPolicy } from './sla/entities/sla-policy.entity';
import { TicketCategory } from './categories/entities/ticket-category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ticketing_system'),
        entities: [User, Ticket, TicketWatcher, Comment, Attachment, KnowledgeArticle, SurveyResponse, SlaPolicy, TicketCategory],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req, res, extra, connectionParams }: any) => {
        // For HTTP requests
        if (req) {
          return { req, res };
        }
        // For WebSocket subscriptions via graphql-ws
        // Prioritize connectionParams (contains auth token from client)
        if (connectionParams?.authToken) {
          return {
            req: {
              headers: {
                authorization: connectionParams.authToken,
              },
            },
          };
        }
        // Fallback: use the raw upgrade request from extra
        if (extra?.request) {
          return { req: extra.request, res: undefined };
        }
        return { req: { headers: {} } };
      },
      formatError: (error) => {
        return {
          message: error.message,
          code: error.extensions?.code,
          locations: error.locations,
          path: error.path,
        };
      },
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            const { connectionParams, extra } = context;
            // Store connectionParams so they are available in the context function
            if (connectionParams?.authToken) {
              context.authToken = connectionParams.authToken;
            }
          },
        },
      },
      installSubscriptionHandlers: true,
    }),
    AuthModule,
    UsersModule,
    TicketsModule,
    CommentsModule,
    AttachmentsModule,
    NotificationsModule,
    DashboardModule,
    SlackModule,
    KnowledgeBaseModule,
    PortalModule,
    SurveysModule,
    PubSubModule,
    SlaModule,
    TasksModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
