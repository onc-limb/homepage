package graph

import (
	"back/blog"
	"back/graph/model"
	"context"
)

type ArticleResolver struct {
	*Resolver
}

func (r *ArticleResolver) Article(ctx context.Context, id int) (*model.Article, error) {
	v, _ := blog.GetArticle(id)
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}
	return &m, nil
}

func (r *ArticleResolver) AllArticles(ctx context.Context) ([]*model.Article, error) {
	// v, _ := blog.GetAllArticles()
	// m := []model.Article{}

	return nil, nil
}

func (r *ArticleResolver) CreateArticle(ctx context.Context, input model.NewArticle) (*model.Article, error) {
	n := blog.NewArticle{
		Title:    input.Title,
		Content:  input.Content,
		Category: blog.Category(input.Category),
	}
	v, _ := blog.CreateArticle(n)
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}

	return &m, nil
}

func (r *ArticleResolver) EditArticle(ctx context.Context, input model.EditArticle) (*model.Article, error) {
	n := blog.ArticleDto{
		ID:       input.ID,
		Title:    *input.Title,
		Content:  *input.Content,
		Category: blog.Category(*input.Category),
	}
	v, _ := blog.EditArticle(n)
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}

	return &m, nil
}
