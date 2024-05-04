package blog

type NewArticle struct {
	Title    string
	Content  string
	Category Category
}

func CreateArticle(input NewArticle) (ArticleDto, error) {
	v := ArticleDto{
		ID:       3,
		Title:    input.Title,
		Content:  input.Content,
		Category: input.Category,
	}
	return v, nil
}
