package application

import "back/blog/domain"

func (u *ArticleUsecase) EditArticle(input domain.ArticleRoot) (domain.ArticleRoot, error) {
	v := domain.ArticleRoot{
		ID:       5,
		Title:    input.Title,
		Content:  input.Content,
		Category: input.Category,
	}
	return v, nil
}
