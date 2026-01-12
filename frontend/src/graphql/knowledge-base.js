import gql from 'graphql-tag'

export const KNOWLEDGE_ARTICLES = gql`
  query KnowledgeArticles($filter: FilterKnowledgeArticlesInput) {
    knowledgeArticles(filter: $filter) {
      id
      title
      slug
      content
      category
      tags
      views
      helpfulCount
      isPublished
      createdAt
      updatedAt
      author {
        id
        fullname
      }
    }
  }
`

export const KNOWLEDGE_ARTICLE = gql`
  query KnowledgeArticle($id: ID!) {
    knowledgeArticle(id: $id) {
      id
      title
      slug
      content
      category
      tags
      views
      helpfulCount
      isPublished
      createdAt
      updatedAt
      author {
        id
        fullname
      }
    }
  }
`

export const POPULAR_ARTICLES = gql`
  query PopularKnowledgeArticles($limit: Int) {
    popularKnowledgeArticles(limit: $limit) {
      id
      title
      slug
      category
      views
      tags
      createdAt
    }
  }
`

export const CREATE_KNOWLEDGE_ARTICLE = gql`
  mutation CreateKnowledgeArticle($input: CreateKnowledgeArticleInput!) {
    createKnowledgeArticle(input: $input) {
      id
      title
      slug
      content
      category
      tags
      isPublished
    }
  }
`

export const UPDATE_KNOWLEDGE_ARTICLE = gql`
  mutation UpdateKnowledgeArticle($id: ID!, $input: UpdateKnowledgeArticleInput!) {
    updateKnowledgeArticle(id: $id, input: $input) {
      id
      title
      slug
      content
      category
      tags
      isPublished
    }
  }
`

export const DELETE_KNOWLEDGE_ARTICLE = gql`
  mutation DeleteKnowledgeArticle($id: ID!) {
    deleteKnowledgeArticle(id: $id)
  }
`

export const RATE_ARTICLE_HELPFUL = gql`
  mutation RateArticleHelpful($id: ID!, $helpful: Boolean!) {
    rateArticleHelpful(id: $id, helpful: $helpful) {
      id
      helpfulCount
    }
  }
`
