package application

import (
	"back/blog/domain"
)

func (u *ArticleUsecase) GetArticle(id uint) (domain.Article, error) {
	return u.ArticleRepository.FindByID(id)
}
