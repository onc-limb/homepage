package blog

func GetArticle(id int) (ArticleDto, error) {
	v := ArticleDto{
		ID: id,
		Title: "最初の投稿",
		Content: "こんにちは",
		Category: CLIMBING,
	}
	return v, nil
}
