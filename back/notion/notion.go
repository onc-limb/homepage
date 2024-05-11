package notion

import (
	"context"
	"os"

	"github.com/jomei/notionapi"
)

type NotionClient struct {
	client *notionapi.Client
}

func NewClient() (client *NotionClient) {
	apiKey := os.Getenv("NOTION_API_KEY")
	return &NotionClient{
		client: notionapi.NewClient(notionapi.Token(apiKey)),
	}
}

func (nc NotionClient) GetPage(pageId string) (*notionapi.Page, error) {
	return nc.client.Page.Get(context.Background(), notionapi.PageID(pageId))
}

func (nc NotionClient) GetAllBlocks(pageId string) ([]notionapi.Block, error) {

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
