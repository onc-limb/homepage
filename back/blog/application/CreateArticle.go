package application

import (
	"back/blog/domain"
)

func (u *ArticleUsecase) InsertArticle(pageId string) (domain.Article, error) {
	article, err := u.ArticleRepository.FindByNotionPageID(pageId)
	if err != nil {
		return domain.Article{}, err
	}

	return u.ArticleRepository.Insert(article)
}
