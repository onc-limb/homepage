package article

import "time"

type Repo interface {
	GetUnique(Category, string) (Article, error)
	Insert(Article) (Article, error)
	Edit(Article) (Article, error)
}

type Article struct {
	Repo         Repo
	ID           string    `json:"id"`
	Category     Category  `json:"category"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	FeaturePoint uint      `json:"featurePoint"`
	PublishedAt  time.Time `json:"publishedAt"`
	EditedAt     time.Time `json:"editedAt"`
}

type Category string

func NewModule(repo Repo) *Article {
	return &Article{
		Repo: repo,
	}
}

func (a *Article) GetArticles() []Article {
	return []Article{{
		ID:           "1",
		Category:     "engineer",
		Title:        "title1",
		Content:      "content1",
		FeaturePoint: 1,
		PublishedAt:  time.Now(),
		EditedAt:     time.Now(),
	}, {
		ID:           "2",
		Category:     "engineer",
		Title:        "title2",
		Content:      "content2",
		FeaturePoint: 3,
		PublishedAt:  time.Now(),
		EditedAt:     time.Now()}}
}
