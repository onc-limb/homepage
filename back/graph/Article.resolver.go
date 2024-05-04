package graph

import (
	"back/graph/model"
	"context"
)



type ArticleResolver struct {
	*Resolver
}

func (r *ArticleResolver) Article (ctx context.Context) (*model.Article, error) {
	return nil, nil
}

func (r *ArticleResolver) AllArticles (ctx context.Context) ([]*model.Article, error) {
	return nil, nil
}

func (r *ArticleResolver) CreateArticle (ctx context.Context, input model.NewArticle) (*model.Article, error) {
	return nil, nil
}

func (r *ArticleResolver) EditArticle (ctx context.Context, input model.EditArticle) (*model.Article, error) {
	return nil, nil
}