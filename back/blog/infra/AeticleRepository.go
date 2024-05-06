package infra

import (
	"back/blog/domain"
	"back/database"
	"log"

	"gorm.io/gorm"
)

type ArticleRepository struct {
	DB *gorm.DB
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{DB: db}
}

func (r *ArticleRepository) FindByID(id uint) (domain.ArticleRoot, error) {
	var article database.Article
	result := r.DB.First(&article, id)
	if result.Error != nil {
		log.Fatal(result.Error)
	}

	v := domain.ArticleRoot{
		ID:       article.ID,
		Title:    article.Title,
		Content:  article.Content,
		Category: domain.Category(article.Category.Name),
	}
	return v, nil
}

func (r *ArticleRepository) Save(article domain.ArticleRoot) (domain.ArticleRoot, error) {
	newArticle := database.Article{
		Title:    article.Title,
		Content:  article.Content,
		Category: database.Category{Name: string(article.Category)},
	}
	result := r.DB.Create(&newArticle)
	if result.Error != nil {
		log.Fatal(result.Error)
	}

	v := domain.ArticleRoot{
		ID:       newArticle.ID,
		Title:    newArticle.Title,
		Content:  newArticle.Content,
		Category: domain.Category(newArticle.Category.Name),
	}
	return v, nil
}
