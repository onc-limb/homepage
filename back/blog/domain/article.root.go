package domain

import (
	"time"
)

type ArticleRoot struct {
	ID       uint
	Title    string
	Content  string
	Category Category
}

type NotionArticle struct {
	PageID    string
	Title     string
	CreatedAt time.Time
	EditedAt  time.Time
	Contents  []Content
}

type Category string

const (
	CLIMBING    Category = "climbing"
	ENGINEERING Category = "engineering"
	LIFE        Category = "life"
)

type NewArticle struct {
	Title    string
	Content  string
	Category Category
}
