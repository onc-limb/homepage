package application

import "back/blog/domain"

type ArticleUsecase struct {
	ArticleRepository domain.ArticleRepository
}

func NewArticleUsecase(r domain.ArticleRepository) *ArticleUsecase {
	return &ArticleUsecase{
		ArticleRepository: r,
	}
}
