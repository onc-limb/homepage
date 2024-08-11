package infra

import (
	"back/article/domain"
	"back/database"
	"time"

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
		return domain.Article{}, err
	}
	c, err := domain.UnmarshalCategory(article.Category.Name)
	if err != nil {
		return domain.Article{}, err
	}

	return domain.Article{
		ID:          article.ID,
		Category:    c,
		PublishedAt: *article.PublishedAt,
		EditedAt:    article.UpdatedAt,
		BaseArticle: domain.BaseArticle{
			Title:        article.Title,
			CategoryId:   article.CategoryID,
			Content:      article.Content,
			FeaturePoint: article.FeaturePoint,
			IsPublished:  article.PublishedAt != nil,
		},
	}, nil
}

func (r *ArticleRepository) Insert(input domain.NewArticle) (domain.Article, error) {
	var publishedAt *time.Time = nil
	if input.IsPublished {
		now := time.Now()
		publishedAt = &now
	}

	article := database.Article{
		Title:        input.Title,
		CategoryID:   input.CategoryId,
		Content:      input.Content,
		FeaturePoint: input.FeaturePoint,
		PublishedAt:  publishedAt,
	}

	if err := r.DB.Create(&article).Error; err != nil {
		return domain.Article{}, err
	}

	return r.FindByID(article.ID)
}

func (r *ArticleRepository) Edit(new domain.Article) (domain.Article, error) {
	return domain.Article{}, nil
}
