package domain

import (
	"time"

	"github.com/google/uuid"
)

type Article struct {
	ID           string
	Category     Category
	Title        string
	Content      string
	FeaturePoint uint
	PublishedAt  time.Time
	EditedAt     time.Time
}

type ArticleOverview struct {
	ID          string
	Category    Category
	Title       string
	PublishedAt time.Time
	EditedAt    time.Time
}

type ArticleInput struct {
	Title    string
	Category Category
	Content  string
}

func CreateArticle(input ArticleInput) Article {
	return Article{
		ID:           uuid.New().String(),
		Category:     input.Category,
		Title:        input.Title,
		Content:      input.Content,
		FeaturePoint: 0,
		PublishedAt:  time.Now(),
		EditedAt:     time.Now(),
	}
}
