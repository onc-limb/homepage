package database

import "gorm.io/gorm"

type Article struct {
	gorm.Model
	Title      string
	Content    string
	CategoryID int
	Category   Category
}

type Category struct {
	gorm.Model
	Name string
}
