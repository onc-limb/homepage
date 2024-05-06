package application

import "back/blog/domain"

func (u *ArticleUsecase) GetAllArticles() ([]domain.ArticleRoot, error) {

	v := []domain.ArticleRoot{
		{ID: 1,
			Title:    "一つ目の記事",
			Content:  "testtest",
			Category: domain.CLIMBING},
		{
			ID:       2,
			Title:    "二つ目の記事",
			Content:  "テストテスト",
			Category: domain.ENGINEERING,
		},
		{
			ID:       3,
			Title:    "三つ目の記事",
			Content:  "てすとてすと",
			Category: domain.LIFE,
		},
	}
	return v, nil
}
