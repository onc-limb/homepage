package database

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	gorm.Model
	Name string `gorm:"not null"`
}

type Article struct {
	gorm.Model
	PublishedAt  *time.Time
	Title        string   `gorm:"not null"`
	CategoryID   uint     `gorm:"not null"`
	Category     Category `gorm:"foreignKey: CategoryID;references:ID; not null"`
	Content      string
	FeaturePoint uint `gorm:"not null"`
}
