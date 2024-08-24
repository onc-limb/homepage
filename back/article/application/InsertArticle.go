package application

import (
	"back/article/domain"
	"back/graph/model"
)

func (u *ArticleUsecase) InsertArticle(article model.InsertDto) (domain.Article, error) {
	return u.ArticleRepository.Insert(domain.CreateArticle(domain.ArticleInput{
		Category: domain.Category(article.Category),
		Title:    article.Title,
		Content:  article.Content,
	}))
}
