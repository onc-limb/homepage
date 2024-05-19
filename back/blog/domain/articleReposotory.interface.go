package domain

type ArticleRepository interface {
	FindByID(uint) (Article, error)
	FindByNotionPageID(string) (NewArticle, error)
	Insert(NewArticle) (Article, error)
	Edit(Article) (Article, error)
}
