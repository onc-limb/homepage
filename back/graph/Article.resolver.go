package graph

import (
	"back/article/application"
	"back/article/domain"
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
	article, err := r.ArticleUsecase.GetArticle(id)
	if err != nil {
		return nil, err
	}
	return convertToModel(article), nil
}

func (r *ArticleResolver) AllArticles(ctx context.Context) ([]*model.Article, error) {
	articles, err := r.ArticleUsecase.GetAllArticles()
	if err != nil {
		return nil, err
	}

	m := make([]*model.Article, len(articles))
	for i, article := range articles {
		m[i] = convertToModel(article)
	}

	return m, nil
}

func (r *ArticleResolver) EditArticle(ctx context.Context, input model.EditArticle) (*model.Article, error) {

	return &model.Article{}, nil
}

func (r *ArticleResolver) InsertArticle(ctx context.Context, input model.InsertDto) (*model.Article, error) {
	article, err := r.ArticleUsecase.InsertArticle(input)
	if err != nil {
		return nil, err
	}

	return convertToModel(article), nil
}

func convertToModel(input domain.Article) *model.Article {
	return &model.Article{
		ID:           int(input.ID),
		Title:        input.Title,
		CategoryID:   int(input.CategoryId),
		Category:     input.Category,
		Content:      input.Content,
		FeaturePoint: int(input.FeaturePoint),
		IsPublished:  input.IsPublished,
		CreatedAt:    input.CreatedAt,
		EditedAt:     input.EditedAt,
	}
}
