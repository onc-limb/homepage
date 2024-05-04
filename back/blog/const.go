package blog

type ArticleDto struct {
	ID       int
	Title    string
	Content  string
	Category Category 
}

type Category string

const (
	CLIMBING Category = "climbing"
	ENGINEERING Category = "engineering"
	LIFE Category = "life"
)