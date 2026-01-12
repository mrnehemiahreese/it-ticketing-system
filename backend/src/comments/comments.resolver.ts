import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PUB_SUB } from '../pubsub/pubsub.module';

export const COMMENT_ADDED_EVENT = 'commentAdded';

@Resolver(() => Comment)
@UseGuards(JwtAuthGuard)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

  @Mutation(() => Comment)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    const comment = await this.commentsService.create(createCommentInput, user.id);
    await this.pubSub.publish(COMMENT_ADDED_EVENT, { 
      commentAdded: comment,
      ticketId: createCommentInput.ticketId,
    });
    return comment;
  }

  @Query(() => [Comment], { name: 'comments' })
  async findAll(): Promise<Comment[]> {
    return this.commentsService.findAll();
  }

  @Query(() => [Comment], { name: 'ticketComments' })
  async findByTicket(
    @Args('ticketId') ticketId: string,
    @CurrentUser() user: User,
  ): Promise<Comment[]> {
    return this.commentsService.findByTicket(ticketId, user);
  }

  @Query(() => Comment, { name: 'comment' })
  async findOne(@Args('id') id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Mutation(() => Comment)
  async updateComment(
    @Args('id') id: string,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentsService.update(id, updateCommentInput, user);
  }

  @Mutation(() => Boolean)
  async removeComment(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.commentsService.remove(id, user);
  }

  @Subscription(() => Comment, {
    name: 'commentAdded',
    filter: (payload, variables) => {
      return payload.ticketId === variables.ticketId;
    },
    resolve: (value) => value.commentAdded,
  })
  commentAdded(@Args('ticketId') ticketId: string) {
    return this.pubSub.asyncIterator([COMMENT_ADDED_EVENT]);
  }
}
