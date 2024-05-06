package graph

import (
	"back/blog/domain"

	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	*gorm.DB
	ArticleRepository domain.ArticleRepository
}
