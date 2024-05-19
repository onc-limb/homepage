package notion

import (
	"back/blog/domain"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jomei/notionapi"
)

type NotionClient struct {
	client *notionapi.Client
}

func GetPageAndBlocks(pageId string) (domain.NewArticle, error) {
	cn := newClient()
	page, err := cn.getPage(pageId)
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

	blocks, err := cn.getAllBlocks(pageId)
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

func newClient() (client *NotionClient) {
	apiKey := os.Getenv("NOTION_API_KEY")
	return &NotionClient{
		client: notionapi.NewClient(notionapi.Token(apiKey)),
	}
}

func (nc NotionClient) getPage(pageId string) (*notionapi.Page, error) {
	return nc.client.Page.Get(context.Background(), notionapi.PageID(pageId))
}

func (nc NotionClient) getAllBlocks(pageId string) ([]notionapi.Block, error) {

	var allBlocks []notionapi.Block
	cursor := ""

	for {
		// ブロックのリストを取得
		response, err := nc.client.Block.GetChildren(context.Background(), notionapi.BlockID(pageId), &notionapi.Pagination{
			StartCursor: notionapi.Cursor(cursor),
			PageSize:    100, // APIの最大値
		})
		if err != nil {
			return nil, err
		}

		allBlocks = append(allBlocks, response.Results...)

		if !response.HasMore {
			break
		}

		cursor = response.NextCursor
	}
	return allBlocks, nil
}
