import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Attachment)
@UseGuards(JwtAuthGuard)
export class AttachmentsResolver {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Mutation(() => Attachment)
  async createAttachment(
    @Args('createAttachmentInput') createAttachmentInput: CreateAttachmentInput,
    @CurrentUser() user: User,
  ): Promise<Attachment> {
    return this.attachmentsService.create(createAttachmentInput, user.id);
  }

  @Query(() => [Attachment], { name: 'attachments' })
  async findAll(): Promise<Attachment[]> {
    return this.attachmentsService.findAll();
  }

  @Query(() => [Attachment], { name: 'ticketAttachments' })
  async findByTicket(@Args('ticketId') ticketId: string): Promise<Attachment[]> {
    return this.attachmentsService.findByTicket(ticketId);
  }

  @Query(() => Attachment, { name: 'attachment' })
  async findOne(@Args('id') id: string): Promise<Attachment> {
    return this.attachmentsService.findOne(id);
  }

  @Mutation(() => Boolean)
  async removeAttachment(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.attachmentsService.remove(id, user);
  }
}
