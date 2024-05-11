package domain

type ArticleRepository interface {
	FindByID(id uint) (ArticleRoot, error)
	FindByNotionPageID(pageId string) (NotionArticle, error)
	Save(article NewArticle) (ArticleRoot, error)
}
