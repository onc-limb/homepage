package application

import (
	"back/article/domain"
)

func (u *ArticleUsecase) GetArticle(id uint) (domain.Article, error) {
	return u.ArticleRepository.FindByID(id)
}
