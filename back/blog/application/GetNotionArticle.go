package application

import (
	"back/blog/domain"
)

func (u *ArticleUsecase) GetNotionArticle(id string) (domain.NotionArticle, error) {
	return u.ArticleRepository.FindByNotionPageID(id)
}
