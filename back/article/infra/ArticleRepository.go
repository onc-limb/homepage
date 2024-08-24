package infra

import (
	"back/article/domain"
	"context"
	"log"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"gorm.io/gorm"
)

type ArticleRepository struct {
	DB     *gorm.DB
	Dynamo *dynamodb.Client
}

func NewArticleRepository(db *gorm.DB, dynamo *dynamodb.Client) *ArticleRepository {
	return &ArticleRepository{DB: db, Dynamo: dynamo}
}

func (r *ArticleRepository) GetUnique(category domain.Category, id string) (domain.Article, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String("Article"),
		Key: map[string]types.AttributeValue{
			"category":  &types.AttributeValueMemberS{Value: category.String()},
			"articleId": &types.AttributeValueMemberS{Value: id},
		},
	}

	result, err := r.Dynamo.GetItem(context.TODO(), input)
	if err != nil {
		log.Println("Failed to get item:", err)
		return domain.Article{}, err
	}
	if result.Item == nil {
		log.Println("No item found")
		return domain.Article{}, nil
	}

	return convertToArticle(result)
}

func (r *ArticleRepository) Insert(input domain.Article) (domain.Article, error) {
	item := map[string]types.AttributeValue{
		"category":     &types.AttributeValueMemberS{Value: input.Category.String()},
		"articleId":    &types.AttributeValueMemberS{Value: input.ID},
		"title":        &types.AttributeValueMemberS{Value: input.Title},
		"content":      &types.AttributeValueMemberS{Value: input.Content},
		"featurePoint": &types.AttributeValueMemberN{Value: strconv.FormatUint(uint64(input.FeaturePoint), 10)},
		"publishedAt":  &types.AttributeValueMemberS{Value: input.PublishedAt.Format(time.RFC3339)},
		"editedAt":     &types.AttributeValueMemberS{Value: input.EditedAt.Format(time.RFC3339)},
		"globalKey":    &types.AttributeValueMemberS{Value: "ALL"},
	}

	_, err := r.Dynamo.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("Article"),
		Item:      item,
	})
	if err != nil {
		log.Println("Failed to create Article:", err)
		return domain.Article{}, err
	}

	return r.GetUnique(input.Category, input.ID)
}

func (r *ArticleRepository) Edit(new domain.Article) (domain.Article, error) {
	return domain.Article{}, nil
}

func convertToArticle(result *dynamodb.GetItemOutput) (domain.Article, error) {
	c, err := domain.UnmarshalCategory(result.Item["category"].(*types.AttributeValueMemberS).Value)
	if err != nil {
		return domain.Article{}, err
	}
	f, err := strconv.ParseUint(result.Item["featurePoint"].(*types.AttributeValueMemberN).Value, 10, 64)
	if err != nil {
		return domain.Article{}, err
	}
	p, err := time.Parse(time.RFC3339, result.Item["publishedAt"].(*types.AttributeValueMemberS).Value)
	if err != nil {
		return domain.Article{}, err
	}
	e, err := time.Parse(time.RFC3339, result.Item["editedAt"].(*types.AttributeValueMemberS).Value)
	if err != nil {
		return domain.Article{}, err
	}

	return domain.Article{
		ID:           result.Item["articleId"].(*types.AttributeValueMemberS).Value,
		Category:     c,
		Title:        result.Item["title"].(*types.AttributeValueMemberS).Value,
		Content:      result.Item["content"].(*types.AttributeValueMemberS).Value,
		FeaturePoint: uint(f),
		PublishedAt:  p,
		EditedAt:     e,
	}, nil
}
