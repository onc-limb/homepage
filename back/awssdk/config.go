package awssdk

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
)

type AwsConfig struct {
	config aws.Config
}

func SetSdkConfig() (*AwsConfig, error) {
	reagion := os.Getenv("AWS_REGION")

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(reagion),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(os.Getenv("AWS_ACCESS_KEY_ID"), os.Getenv("AWS_SECRET_ACCESS_KEY"), "")),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %w", err)
	}
	return &AwsConfig{config: cfg}, nil
}
