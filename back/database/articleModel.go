package database

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	Name string
}

type Article struct {
	gorm.Model
	Title        string
	CategoryID   uint
	Category     Category `gorm:"foreignKey: CategoryID;references:ID"`
	Content      string
	FeaturePoint uint
	IsPublished  bool
}
