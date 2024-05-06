package domain

type ArticleRepository interface {
	FindByID(id uint) (ArticleRoot, error)
	Save(article NewArticle) (ArticleRoot, error)
}
