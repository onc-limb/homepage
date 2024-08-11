package domain

import (
	"time"
)

type BaseArticle struct {
	Title        string
	CategoryId   uint
	Content      string
	FeaturePoint uint
	IsPublished  bool
}

type Article struct {
	ID          uint
	Category    Category
	PublishedAt time.Time
	EditedAt    time.Time
	BaseArticle
}

type NewArticle struct {
	BaseArticle
}
