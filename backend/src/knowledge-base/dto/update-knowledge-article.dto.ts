import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateKnowledgeArticleInput } from './create-knowledge-article.dto';

@InputType()
export class UpdateKnowledgeArticleInput extends PartialType(CreateKnowledgeArticleInput) {}
