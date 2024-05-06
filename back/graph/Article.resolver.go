package graph

import (
	"back/blog/application"
	"back/graph/model"
	"context"
)

type ArticleResolver struct {
	*Resolver
}

func (r *ArticleResolver) Article(ctx context.Context, id uint) (*model.Article, error) {
	v, _ := application.GetArticle(r.DB, id)
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}
	return &m, nil
}

func (r *ArticleResolver) AllArticles(ctx context.Context) ([]*model.Article, error) {
	v, e := application.GetAllArticles()
	if e != nil {
		return nil, e
	}

	m := make([]*model.Article, len(v))
	for i, a := range v {
		m[i] = &model.Article{
			ID:       a.ID,
			Title:    a.Title,
			Content:  a.Content,
			Category: model.Category(a.Category),
		}
	}

	return m, nil
}

func (r *ArticleResolver) CreateArticle(ctx context.Context, input model.NewArticle) (*model.Article, error) {
	n := application.NewArticle{
		Title:    input.Title,
		Content:  input.Content,
		Category: application.Category(input.Category),
	}
	v, _ := application.CreateArticle(n)
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}

	return &m, nil
}

func (r *ArticleResolver) EditArticle(ctx context.Context, input model.EditArticle) (*model.Article, error) {
	n := application.ArticleDto{
		ID:       input.ID,
		Title:    *input.Title,
		Content:  *input.Content,
		Category: application.Category(*input.Category),
	}
	v, _ := application.EditArticle(n)
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}

	return &m, nil
}
