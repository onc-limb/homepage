package awssdk

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type DynamoDB struct {
	Client *dynamodb.Client
}

func (a *AwsConfig) SetupDynamoDB(migrateCommand bool) *dynamodb.Client {
	var client *dynamodb.Client
	switch os.Getenv("ENV") {
	case "local":
		client = dynamodb.NewFromConfig(a.config, func(o *dynamodb.Options) {
			o.BaseEndpoint = aws.String("http://localhost:8000")
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
				AttributeName: aws.String("Id"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
	}
	_, err := d.CreateTable(context.TODO(), input)
	if err != nil {
		log.Println("Failed to create table", err)
	}
	log.Println("Success to create table")
}
