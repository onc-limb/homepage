package awssdk

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func (a *AwsConfig) SetupDynamoDB(migrateCommand bool) *dynamodb.Client {
	var client *dynamodb.Client
	switch os.Getenv("ENV") {
	case "local":
		client = dynamodb.NewFromConfig(a.config, func(o *dynamodb.Options) {
			o.BaseEndpoint = aws.String("http://dynamodb-local:8000")
		})
	case "prd":
		client = dynamodb.NewFromConfig(a.config)

	default:
		log.Println("ENV is not set")
	}
	if migrateCommand {
		createTable(client)
	}
	return client
}

func createTable(d *dynamodb.Client) {
	input := &dynamodb.CreateTableInput{
		TableName: aws.String("Article"),
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("category"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("articleId"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("editedAt"),
				AttributeType: types.ScalarAttributeTypeS,
			},
			{
				AttributeName: aws.String("featurePoint"),
				AttributeType: types.ScalarAttributeTypeN,
			},
			{
				AttributeName: aws.String("globalKey"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("category"),
				KeyType:       types.KeyTypeHash,
			},
			{
				AttributeName: aws.String("articleId"),
				KeyType:       types.KeyTypeRange,
			},
		},
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
			{
				IndexName: aws.String("ArticleIDIndex"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("articleId"),
						KeyType:       types.KeyTypeHash,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(5),
					WriteCapacityUnits: aws.Int64(5),
				},
			},
			{
				IndexName: aws.String("EditedAtIndex"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("globalKey"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("editedAt"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(5),
					WriteCapacityUnits: aws.Int64(5),
				},
			},
			{
				IndexName: aws.String("FeaturePointIndex"),
				KeySchema: []types.KeySchemaElement{
					{
						AttributeName: aws.String("globalKey"),
						KeyType:       types.KeyTypeHash,
					},
					{
						AttributeName: aws.String("featurePoint"),
						KeyType:       types.KeyTypeRange,
					},
				},
				Projection: &types.Projection{
					ProjectionType: types.ProjectionTypeAll,
				},
				ProvisionedThroughput: &types.ProvisionedThroughput{
					ReadCapacityUnits:  aws.Int64(5),
					WriteCapacityUnits: aws.Int64(5),
				},
			},
		},
		ProvisionedThroughput: &types.ProvisionedThroughput{
			ReadCapacityUnits:  aws.Int64(5),
			WriteCapacityUnits: aws.Int64(5),
		},
	}
	_, err := d.CreateTable(context.TODO(), input)
	if err != nil {
		log.Println("Failed to create table", err)
	} else {
		log.Println("Success to create table")
	}

}
