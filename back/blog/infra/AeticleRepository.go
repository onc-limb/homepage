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
		switch block.GetType() {
		case "paragraph":
			p := block.(*notionapi.ParagraphBlock).Paragraph
			if len(p.RichText) > 0 {
				contents = append(contents, domain.Content{
					Type:         string(block.GetType()),
					Text:         p.RichText[0].PlainText,
					Bold:         p.RichText[0].Annotations.Bold,
					Italic:       p.RichText[0].Annotations.Italic,
					StrikThrough: p.RichText[0].Annotations.Strikethrough,
					UnderLine:    p.RichText[0].Annotations.Underline,
					Code:         p.RichText[0].Annotations.Code,
				})
			} else {
				contents = append(contents, domain.Content{
					Type:         string(block.GetType()),
					Text:         "\n",
					Bold:         false,
					Italic:       false,
					StrikThrough: false,
					UnderLine:    false,
					Code:         false,
				})
			}

		case "heading_1":
			rt := block.(*notionapi.Heading1Block).Heading1.RichText[0]
			fmt.Printf("Head1:%s", rt.PlainText)
			contents = append(contents, domain.Content{
				Type:         string(block.GetType()),
				Text:         rt.PlainText,
				Bold:         rt.Annotations.Bold,
				Italic:       rt.Annotations.Italic,
				StrikThrough: rt.Annotations.Strikethrough,
				UnderLine:    rt.Annotations.Underline,
				Code:         rt.Annotations.Code,
			})

		case "heading_2":
			rt := block.(*notionapi.Heading2Block).Heading2.RichText[0]
			fmt.Printf("Head2:%s", rt.PlainText)
			contents = append(contents, domain.Content{
				Type:         string(block.GetType()),
				Text:         rt.PlainText,
				Bold:         rt.Annotations.Bold,
				Italic:       rt.Annotations.Italic,
				StrikThrough: rt.Annotations.Strikethrough,
				UnderLine:    rt.Annotations.Underline,
				Code:         rt.Annotations.Code,
			})

		case "heading_3":
			rt := block.(*notionapi.Heading3Block).Heading3.RichText[0]
			contents = append(contents, domain.Content{
				Type:         string(block.GetType()),
				Text:         rt.PlainText,
				Bold:         rt.Annotations.Bold,
				Italic:       rt.Annotations.Italic,
				StrikThrough: rt.Annotations.Strikethrough,
				UnderLine:    rt.Annotations.Underline,
				Code:         rt.Annotations.Code,
			})

		case "bulleted_list_item":
			rt := block.(*notionapi.BulletedListItemBlock).BulletedListItem.RichText[0]
			fmt.Printf("List:%s", rt.PlainText)
			contents = append(contents, domain.Content{
				Type:         string(block.GetType()),
				Text:         rt.PlainText,
				Bold:         rt.Annotations.Bold,
				Italic:       rt.Annotations.Italic,
				StrikThrough: rt.Annotations.Strikethrough,
				UnderLine:    rt.Annotations.Underline,
				Code:         rt.Annotations.Code,
			})

		case "code":
			rt := block.(*notionapi.CodeBlock).Code.RichText[0]
			fmt.Printf("Code:%s", rt.PlainText)
			contents = append(contents, domain.Content{
				Type:         string(block.GetType()),
				Text:         rt.PlainText,
				Bold:         rt.Annotations.Bold,
				Italic:       rt.Annotations.Italic,
				StrikThrough: rt.Annotations.Strikethrough,
				UnderLine:    rt.Annotations.Underline,
				Code:         rt.Annotations.Code,
			})

		default:
			rt := block.(*notionapi.UnsupportedBlock).GetRichTextString()
			fmt.Printf("Def:%s", rt)
			contents = append(contents, domain.Content{
				Type:         "unsupported",
				Text:         rt,
				Bold:         false,
				Italic:       false,
				StrikThrough: false,
				UnderLine:    false,
				Code:         false,
			})
		}
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
