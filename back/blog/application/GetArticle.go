package application

import (
	"back/blog/infra"
	"log"

	"gorm.io/gorm"
)

func GetArticle(db *gorm.DB, id uint) (ArticleDto, error) {
	r := infra.NewArticleRepository(db)
	v, err := r.FindByID(id)
	if err != nil {
		log.Fatal(err)
	}
	d := ArticleDto{
		ID:       v.ID,
		Title:    v.Title,
		Content:  v.Content,
		Category: Category(v.Category),
	}
	return d, nil
}
