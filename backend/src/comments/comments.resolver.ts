import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Comment)
@UseGuards(JwtAuthGuard)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comment)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentsService.create(createCommentInput, user.id);
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
}
