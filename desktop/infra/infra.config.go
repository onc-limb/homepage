package infra

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type awsConfig struct {
	config aws.Config
}

func setSdkConfig() (*awsConfig, error) {
	reagion := os.Getenv("AWS_REGION")

	var cfg aws.Config
	var err error

	switch os.Getenv("ENV") {
	case "local":
		cfg, err = config.LoadDefaultConfig(context.TODO(),
			config.WithRegion(reagion),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(os.Getenv("AWS_ACCESS_KEY_ID"), os.Getenv("AWS_SECRET_ACCESS_KEY"), "")),
		)
	case "prd":
		cfg, err = config.LoadDefaultConfig(context.TODO(),
			config.WithRegion(reagion),
		)
	}

	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %w", err)
	}
	return &awsConfig{config: cfg}, nil
}

func SetupDynamoDB() (*dynamodb.Client, error) {
	a, err := setSdkConfig()
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %w", err)
	}
	var client *dynamodb.Client
	switch os.Getenv("ENV") {
	case "local":
		client = dynamodb.NewFromConfig(a.config, func(o *dynamodb.Options) {
			o.BaseEndpoint = aws.String(os.Getenv("DYNAMODB_ENDPOINT"))
		})
	case "prd":
		client = dynamodb.NewFromConfig(a.config)

	default:
		log.Println("ENV is not set")
	}
	return client, nil
}
