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

func (r *ArticleRepository) FindByID(id uint) (domain.Article, error) {
	var article database.Article
	if err := r.DB.Preload("Contents").Preload("Category").First(&article, id).Error; err != nil {
		log.Fatal(err)
	}

	var contents []domain.Content
	for _, content := range article.Contents {
		contents = append(contents, domain.Content{
			ID:           content.ID,
			ArticleID:    content.ArticleID,
			Order:        content.Order,
			Type:         content.Type,
			Text:         content.Text,
			Bold:         content.Bold,
			Italic:       content.Italic,
			StrikThrough: content.StrikThrough,
			UnderLine:    content.UnderLine,
			Code:         content.Code,
		})
	}

	return domain.Article{
		ID:           article.ID,
		PageID:       article.PageID,
		Title:        article.Title,
		CategoryId:   article.CategoryID,
		Category:     domain.Category(article.Category.Name),
		Contents:     contents,
		FeaturePoint: article.FeaturePoint,
		IsPublished:  article.IsPublished,
		CreatedAt:    article.CreatedAt,
		EditedAt:     article.UpdatedAt,
	}, nil
}

func (r *ArticleRepository) FindByNotionPageID(pageId string) (domain.NewArticle, error) {
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
			fmt.Printf("Head1:%s\n", rt.PlainText)
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
			fmt.Printf("Head2:%s\n", rt.PlainText)
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
			fmt.Printf("List:%s\n", rt.PlainText)
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
			fmt.Printf("Code:%s\n", rt.PlainText)
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
			fmt.Printf("Def:%s\n", rt)
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

	v := domain.NewArticle{
		PageID:       page.ID.String(),
		Title:        title[0],
		CategoryId:   1,
		Contents:     contents,
		FeaturePoint: 0,
		IsPublished:  true,
	}
	return v, nil
}

func (r *ArticleRepository) Insert(input domain.NewArticle) (domain.Article, error) {
	article := database.Article{
		PageID:       input.PageID,
		Title:        input.Title,
		CategoryID:   input.CategoryId,
		FeaturePoint: input.FeaturePoint,
		IsPublished:  input.IsPublished,
	}

	err := r.DB.Transaction(func(tx *gorm.DB) error {
		if err := r.DB.Create(&article).Error; err != nil {
			return err
		}

		var contents []database.Content
		for i, c := range input.Contents {
			contents = append(contents, database.Content{
				ArticleID:    article.ID,
				Order:        uint(i),
				Type:         c.Type,
				Text:         c.Text,
				Bold:         c.Bold,
				Italic:       c.Italic,
				StrikThrough: c.StrikThrough,
				UnderLine:    c.UnderLine,
				Code:         c.Code,
			})
		}

		if err := r.DB.Create(&contents).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return domain.Article{}, err
	}

	return r.FindByID(article.ID)
}

func (r *ArticleRepository) Edit(new domain.Article) (domain.Article, error) {
	return domain.Article{}, nil
}
