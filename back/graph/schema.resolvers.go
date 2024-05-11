package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.45

import (
	"back/graph/model"
	"context"
)

// CreateArticle is the resolver for the createArticle field.
func (r *mutationResolver) CreateArticle(ctx context.Context, input model.NewArticle) (*model.Article, error) {
	articleResolver := NewResolver(r.ArticleRepository)
	return articleResolver.CreateArticle(ctx, input)
}

// EditArticle is the resolver for the editArticle field.
func (r *mutationResolver) EditArticle(ctx context.Context, input model.EditArticle) (*model.Article, error) {
	articleResolver := NewResolver(r.ArticleRepository)
	return articleResolver.EditArticle(ctx, input)
}

// AllArticles is the resolver for the allArticles field.
func (r *queryResolver) AllArticles(ctx context.Context) ([]*model.Article, error) {
	articleResolver := NewResolver(r.ArticleRepository)
	return articleResolver.AllArticles(ctx)
}

// Article is the resolver for the article field.
func (r *queryResolver) Article(ctx context.Context, input uint) (*model.Article, error) {
	articleResolver := NewResolver(r.ArticleRepository)
	return articleResolver.Article(ctx, input)
}

// NotionArticle is the resolver for the notionArticle field.
func (r *queryResolver) NotionArticle(ctx context.Context, input *string) (*model.NotionArticle, error) {
	articleResolver := NewResolver(r.ArticleRepository)
	return articleResolver.NotionArticle(ctx, *input)
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
