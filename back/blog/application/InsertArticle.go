package application

import (
	"back/blog/domain"
	"back/graph/model"
)

func (u *ArticleUsecase) InsertArticle(article model.InsertDto) (domain.Article, error) {
	return u.ArticleRepository.Insert(domain.NewArticle{
		BaseArticle: domain.BaseArticle{
			Title:        article.Title,
			CategoryId:   uint(article.Category),
			Content:      article.Content,
			FeaturePoint: uint(article.FeaturePoint),
			IsPublished:  article.IsPublished,
		},
	})
}
