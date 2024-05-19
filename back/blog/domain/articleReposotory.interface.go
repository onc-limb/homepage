package domain

type ArticleRepository interface {
	FindByID(uint) (Article, error)
	Insert(NewArticle) (Article, error)
	Edit(Article) (Article, error)
}
