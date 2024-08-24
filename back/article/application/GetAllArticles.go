package application

import "back/article/domain"

func (u *ArticleUsecase) GetAllArticles() ([]domain.ArticleOverview, error) {
	// fixme: 未実装　引数にoffsetとlimitをもらう。
	return nil, nil
}
