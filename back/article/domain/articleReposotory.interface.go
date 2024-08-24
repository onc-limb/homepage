package domain

type ArticleRepository interface {
	GetUnique(Category, string) (Article, error)
	Insert(Article) (Article, error)
	Edit(Article) (Article, error)
}
