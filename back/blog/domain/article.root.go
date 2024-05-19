package domain

import (
	"time"
)

type Article struct {
	ID           uint
	PageID       string
	Title        string
	CategoryId   uint
	Category     Category
	Contents     []Content
	FeaturePoint uint
	IsPublished  bool
	CreatedAt    time.Time
	EditedAt     time.Time
}

type NewArticle struct {
	PageID       string
	Title        string
	CategoryId   uint
	Contents     []Content
	FeaturePoint uint
	IsPublished  bool
}
