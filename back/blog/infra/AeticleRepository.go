package infra

import (
	"back/blog/domain"
	"back/database"
	"back/notion"
	"fmt"
	"log"

	"github.com/jomei/notionapi"
	"gorm.io/gorm"
)

type ArticleRepository struct {
	DB *gorm.DB
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{DB: db}
}

func (r *ArticleRepository) FindByID(id uint) (domain.ArticleRoot, error) {
	var article database.Article
	result := r.DB.First(&article, id)
	if result.Error != nil {
		log.Fatal(result.Error)
	}

	v := domain.ArticleRoot{
		ID:       article.ID,
		Title:    article.Title,
		Content:  article.Content,
		Category: domain.Category(article.Category.Name),
	}
	return v, nil
}

func (r *ArticleRepository) FindByNotionPageID(pageId string) (domain.NotionArticle, error) {
	cn := notion.NewClient()
	page, err := cn.GetPage(pageId)
	if err != nil {
		log.Print(err)
	}

	// fixme: Titleフィールドがなかった時の判定を追加する
	var title []string
	// title := page.Properties["Title"].(*notionapi.TitleProperty).Title[0].PlainText
	if titleProp, ok := page.Properties["title"].(*notionapi.TitleProperty); ok {
		for _, t := range titleProp.Title {
			title = append(title, t.PlainText)
		}
	} else {
		title = append(title, "no title")
	}

	blocks, err := cn.GetAllBlocks(pageId)
	if err != nil {
		log.Print(err)
	}

	var contents []domain.Content

	for _, block := range blocks {
		// switch block.GetType() {
		// case "paragraph":

		// case "bulleted_list_item":

		// case "code":

		// default:
		// }
		fmt.Println(block.GetType())
	}

	v := domain.NotionArticle{
		PageID:    page.ID.String(),
		Title:     title[0],
		CreatedAt: page.CreatedTime.Local(),
		EditedAt:  page.LastEditedTime.Local(),
		Contents:  contents,
	}
	return v, nil
}

func (r *ArticleRepository) Save(article domain.NewArticle) (domain.ArticleRoot, error) {
	newArticle := database.Article{
		Title:      article.Title,
		Content:    article.Content,
		CategoryID: 1,
	}
	result := r.DB.Create(&newArticle)
	if result.Error != nil {
		log.Fatal(result.Error)
	}

	v := domain.ArticleRoot{
		ID:       newArticle.ID,
		Title:    newArticle.Title,
		Content:  newArticle.Content,
		Category: domain.Category(newArticle.Category.Name),
	}
	return v, nil
}
