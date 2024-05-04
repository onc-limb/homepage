package blog

func EditArticle(input ArticleDto) (ArticleDto, error) {
	v := ArticleDto{
		ID:       5,
		Title:    input.Title,
		Content:  input.Content,
		Category: input.Category,
	}
	return v, nil
}
