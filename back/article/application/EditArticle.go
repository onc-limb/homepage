package application

import "back/article/domain"

func (u *ArticleUsecase) EditArticle(input domain.Article) (domain.Article, error) {
	// fixme: idでレコードを特定して、該当カラムを更新する処理をrepositoryに定義してから呼ぶ
	v := domain.Article{}
	return v, nil
}
