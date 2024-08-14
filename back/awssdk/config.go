package awssdk

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
)

type AwsConfig struct {
	config aws.Config
}

func SetSdkConfig() (*AwsConfig, error) {
	reagion := os.Getenv("AWS_REGION")

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(reagion),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %w", err)
	}
	return &AwsConfig{config: cfg}, nil
}
