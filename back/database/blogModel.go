package database

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	Name string
}

type Article struct {
	gorm.Model
	PageID       string
	Title        string
	CategoryID   uint
	Category     Category  `gorm:"foreignKey: CategoryID;references:ID"`
	Contents     []Content `gorm:"foreignKey:ArticleID;references:ID"`
	FeaturePoint uint
	IsPublished  bool
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
