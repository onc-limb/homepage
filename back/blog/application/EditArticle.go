package application

import "back/blog/domain"

func (u *ArticleUsecase) EditArticle(input domain.ArticleRoot) (domain.ArticleRoot, error) {
	// fixme: idでレコードを特定して、該当カラムを更新する処理をrepositoryに定義してから呼ぶ
	v := domain.ArticleRoot{
		ID:       5,
		Title:    input.Title,
		Content:  input.Content,
		Category: input.Category,
	}
	return v, nil
}
