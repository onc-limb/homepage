package graph

import (
	"back/blog/application"
	"back/blog/domain"
	"back/graph/model"
	"context"
)

type ArticleResolver struct {
	*Resolver
	ArticleUsecase *application.ArticleUsecase
}

func NewResolver(ArticleRepo domain.ArticleRepository) *ArticleResolver {
	articleUsecase := application.NewArticleUsecase(ArticleRepo)
	return &ArticleResolver{
		ArticleUsecase: articleUsecase,
	}
}

func (r *ArticleResolver) Article(ctx context.Context, id uint) (*model.Article, error) {
	v, err := r.ArticleUsecase.GetArticle(id)
	if err != nil {
		return nil, err
	}
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}
	return &m, nil
}

func (r *ArticleResolver) NotionArticle(ctx context.Context, pageId string) (*model.NotionArticle, error) {
	v, err := r.ArticleUsecase.GetNotionArticle(pageId)
	if err != nil {
		return nil, err
	}
	var c []*model.Content

	for _, content := range v.Contents {
		c = append(c, &model.Content{
			Type:         content.Type,
			Text:         content.Text,
			Bold:         content.Bold,
			Italic:       content.Italic,
			StrikThrough: content.StrikThrough,
			UnderLine:    content.UnderLine,
			Code:         content.Code,
		})
	}

	m := model.NotionArticle{
		ID:        v.PageID,
		Title:     v.Title,
		CreatedAt: v.CreatedAt,
		EditedAt:  v.EditedAt,
		Contents:  c,
	}
	return &m, nil

}

func (r *ArticleResolver) AllArticles(ctx context.Context) ([]*model.Article, error) {
	v, err := r.ArticleUsecase.GetAllArticles()
	if err != nil {
		return nil, err
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
	new := domain.NewArticle{
		Title:    input.Title,
		Content:  input.Content,
		Category: domain.Category(input.Category),
	}
	v, err := r.ArticleUsecase.CreateArticle(new)
	if err != nil {
		return nil, err
	}

	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}

	return &m, nil
}

func (r *ArticleResolver) EditArticle(ctx context.Context, input model.EditArticle) (*model.Article, error) {
	new := domain.ArticleRoot{
		ID:       input.ID,
		Title:    *input.Title,
		Content:  *input.Content,
		Category: domain.Category(*input.Category),
	}
	v, err := r.ArticleUsecase.EditArticle(new)
	if err != nil {
		return nil, err
	}
	m := model.Article{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: model.Category(v.Category),
	}

	return &m, nil
}
