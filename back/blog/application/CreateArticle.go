package application

import (
	"back/blog/domain"
	"log"
)

type NewArticleDto struct {
	Title    string
	Content  string
	Category Category
}

func (u *ArticleUsecase) CreateArticle(input domain.NewArticle) (domain.ArticleRoot, error) {
	v, err := u.ArticleRepository.Save(input)
	if err != nil {
		log.Fatal(err)
	}
	return v, nil
}
