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

func (r *ArticleRepository) FindByID(id uint) (domain.Article, error) {
	var article database.Article
	if err := r.DB.Preload("Contents").Preload("Category").First(&article, id).Error; err != nil {
		log.Fatal(err)
	}

	var contents []domain.Content
	for _, content := range article.Contents {
		contents = append(contents, domain.Content{
			ID:           content.ID,
			ArticleID:    content.ArticleID,
			Order:        content.Order,
			Type:         content.Type,
			Text:         content.Text,
			Bold:         content.Bold,
			Italic:       content.Italic,
			StrikThrough: content.StrikThrough,
			UnderLine:    content.UnderLine,
			Code:         content.Code,
		})
	}
	c, _ := domain.UnmarshalCategory(article.Category.Name)

	return domain.Article{
		ID:           article.ID,
		PageID:       article.PageID,
		Title:        article.Title,
		CategoryId:   article.CategoryID,
		Category:     c,
		Contents:     contents,
		FeaturePoint: article.FeaturePoint,
		IsPublished:  article.IsPublished,
		CreatedAt:    article.CreatedAt,
		EditedAt:     article.UpdatedAt,
	}, nil
}

func (r *ArticleRepository) Insert(input domain.NewArticle) (domain.Article, error) {
	article := database.Article{
		PageID:       input.PageID,
		Title:        input.Title,
		CategoryID:   input.CategoryId,
		FeaturePoint: input.FeaturePoint,
		IsPublished:  input.IsPublished,
	}

	err := r.DB.Transaction(func(tx *gorm.DB) error {
		if err := r.DB.Create(&article).Error; err != nil {
			return err
		}

		var contents []database.Content
		for i, c := range input.Contents {
			contents = append(contents, database.Content{
				ArticleID:    article.ID,
				Order:        uint(i),
				Type:         c.Type,
				Text:         c.Text,
				Bold:         c.Bold,
				Italic:       c.Italic,
				StrikThrough: c.StrikThrough,
				UnderLine:    c.UnderLine,
				Code:         c.Code,
			})
		}

		if err := r.DB.Create(&contents).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return domain.Article{}, err
	}

	return r.FindByID(article.ID)
}

func (r *ArticleRepository) Edit(new domain.Article) (domain.Article, error) {
	return domain.Article{}, nil
}
