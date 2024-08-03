package application

import (
	"back/article/domain"
	"back/notion"
	"fmt"
)

func (u *ArticleUsecase) InsertArticleFromNotion(pageId string, category domain.Category) (domain.Article, error) {
	article, err := notion.GetPageAndBlocks(pageId)
	if err != nil {
		return domain.Article{}, err
	}

	fmt.Print(article)

	// markdownへの変換処理

	// return u.ArticleRepository.Insert(domain.NewArticle{
	// 	PageID:       article.PageID,
	// 	Title:        article.Title,
	// 	CategoryId:   uint(category),
	// 	Contents:     article.Contents,
	// 	FeaturePoint: article.FeaturePoint,
	// 	IsPublished:  true,
	// })
	return domain.Article{}, err
}
