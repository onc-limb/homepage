package application

import (
	"back/article/domain"
)

func (u *ArticleUsecase) GetArticle(category domain.Category, id string) (domain.Article, error) {
	return u.ArticleRepository.GetUnique(category, id)
}
