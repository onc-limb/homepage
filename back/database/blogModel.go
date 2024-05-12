package database

import "gorm.io/gorm"

type Article struct {
	gorm.Model
	Title      string
	Content    string
	CategoryID uint
	Category   Category `gorm:"foreignKey: CategoryID;references:ID"`
}

type Category struct {
	gorm.Model
	Name string
}

type NotionArticle struct {
	gorm.Model
	Title      string
	CategoryID uint
	Category   Category  `gorm:"foreignKey: CategoryID;references:ID"`
	Contents   []Content `gorm:"foreignKey:ArticleID;references:ID"`
}

type Content struct {
	gorm.Model
	ArticleID    uint `gorm:"primaryKey;autoIncrement:false"`
	Order        uint `gorm:"primaryKey;autoIncrement:false"`
	Type         string
	Text         string
	Bold         bool
	Italic       bool
	StrikThrough bool
	UnderLine    bool
	Code         bool
}
