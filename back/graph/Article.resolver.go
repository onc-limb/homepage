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
	article, err := r.ArticleUsecase.GetArticle(id)
	if err != nil {
		return nil, err
	}
	return convertToModel(article)
}

func (r *ArticleResolver) AllArticles(ctx context.Context) ([]*model.Article, error) {
	articles, err := r.ArticleUsecase.GetAllArticles()
	if err != nil {
		return nil, err
	}

	m := make([]*model.Article, len(articles))
	for i, article := range articles {
		m[i] = &model.Article{
			ID:    int(article.ID),
			Title: article.Title,
		}
	}

	return []*model.Article{}, nil
}

func (r *ArticleResolver) EditArticle(ctx context.Context, input model.EditArticle) (*model.Article, error) {

	return &model.Article{}, nil
}

func (r *ArticleResolver) InsertArticle(ctx context.Context, input model.NotionPage) (*model.Article, error) {
	article, err := r.ArticleUsecase.InsertArticle(*input.PageID)
	if err != nil {
		return nil, err
	}

	return convertToModel(article)
}

func convertToModel(input domain.Article) (*model.Article, error) {
	var contents []*model.Content

	for _, c := range input.Contents {
		contents = append(contents, &model.Content{
			ID:           int(c.ID),
			ArticleID:    int(c.ArticleID),
			Order:        int(c.Order),
			Type:         c.Type,
			Text:         c.Text,
			Bold:         c.Bold,
			Italic:       c.Italic,
			StrikThrough: c.StrikThrough,
			UnderLine:    c.UnderLine,
			Code:         c.Code,
		})
	}

	return &model.Article{
		ID:           int(input.ID),
		PageID:       input.PageID,
		Title:        input.Title,
		Contents:     contents,
		FeaturePoint: int(input.FeaturePoint),
		IsPublished:  input.IsPublished,
		CreatedAt:    input.CreatedAt,
		EditedAt:     input.EditedAt,
	}, nil
}
