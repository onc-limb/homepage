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

func (r *ArticleResolver) Article(ctx context.Context, input model.ArticleCompositeKey) (*model.Article, error) {
	article, err := r.ArticleUsecase.GetArticle(input.Category, input.ID)
	if err != nil {
		return nil, err
	}
	return convertToModel(article), nil
}

func (r *ArticleResolver) AllArticles(ctx context.Context) ([]*model.ArticleOverview, error) {
	articles, err := r.ArticleUsecase.GetAllArticles()
	if err != nil {
		return nil, err
	}

	m := make([]*model.ArticleOverview, len(articles))
	for i, article := range articles {
		m[i] = convertToModelOverview(article)
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
		ID:           input.ID,
		Title:        input.Title,
		Category:     input.Category,
		Content:      input.Content,
		FeaturePoint: int(input.FeaturePoint),
		PublishedAt:  input.PublishedAt,
		EditedAt:     input.EditedAt,
	}
}

func convertToModelOverview(input domain.ArticleOverview) *model.ArticleOverview {
	return &model.ArticleOverview{
		ID:          input.ID,
		Title:       input.Title,
		Category:    input.Category,
		PublishedAt: input.PublishedAt,
		EditedAt:    input.EditedAt,
	}
}
