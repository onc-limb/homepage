package application

import (
	"back/blog/domain"
	"log"
)

func (u *ArticleUsecase) GetArticle(id uint) (domain.ArticleRoot, error) {
	v, err := u.ArticleRepository.FindByID(id)
	if err != nil {
		log.Fatal(err)
	}
	return v, nil
}
