package application

import (
	"back/blog/domain"
	"back/notion"
)

func (u *ArticleUsecase) InsertArticle(pageId string, category domain.Category) (domain.Article, error) {
	article, err := notion.GetPageAndBlocks(pageId)
	if err != nil {
		return domain.Article{}, err
	}

	return u.ArticleRepository.Insert(domain.NewArticle{
		PageID:       article.PageID,
		Title:        article.Title,
		CategoryId:   uint(category),
		Contents:     article.Contents,
		FeaturePoint: article.FeaturePoint,
		IsPublished:  true,
	})
}
