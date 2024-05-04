package blog

func GetAllArticles() ([]ArticleDto, error) {
	v := []ArticleDto{
		{ID: 1,
			Title:    "一つ目の記事",
			Content:  "testtest",
			Category: CLIMBING},
		{
			ID:       2,
			Title:    "二つ目の記事",
			Content:  "テストテスト",
			Category: ENGINEERING,
		},
		{
			ID:       3,
			Title:    "三つ目の記事",
			Content:  "てすとてすと",
			Category: LIFE,
		},
	}
	return v, nil
}
