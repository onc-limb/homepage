package infra

import (
	"back/article/domain"
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

func (r *ArticleRepository) FindByID(id uint) (domain.Article, error) {
	var article database.Article
	if err := r.DB.Preload("Category").First(&article, id).Error; err != nil {
		log.Fatal(err)
	}
	c, _ := domain.UnmarshalCategory(article.Category.Name)

	return domain.Article{
		ID:        article.ID,
		Category:  c,
		CreatedAt: article.CreatedAt,
		EditedAt:  article.UpdatedAt,
		BaseArticle: domain.BaseArticle{
			Title:        article.Title,
			CategoryId:   article.CategoryID,
			Content:      article.Content,
			FeaturePoint: article.FeaturePoint,
			IsPublished:  article.IsPublished,
		},
	}, nil
}

func (r *ArticleRepository) Insert(input domain.NewArticle) (domain.Article, error) {
	article := database.Article{
		Title:        input.Title,
		CategoryID:   input.CategoryId,
		Content:      input.Content,
		FeaturePoint: input.FeaturePoint,
		IsPublished:  input.IsPublished,
	}

	if err := r.DB.Create(&article).Error; err != nil {
		return domain.Article{}, err
	}

	return r.FindByID(article.ID)
}

func (r *ArticleRepository) Edit(new domain.Article) (domain.Article, error) {
	return domain.Article{}, nil
}
