package application

import "back/blog/domain"

func (u *ArticleUsecase) GetAllArticles() ([]domain.ArticleRoot, error) {
	// fixme: 未実装　引数にoffsetとlimitをもらう。
	return nil, nil
}
