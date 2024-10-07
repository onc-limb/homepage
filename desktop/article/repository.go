package article

import "github.com/aws/aws-sdk-go-v2/service/dynamodb"

type Repository struct {
	Dynamo *dynamodb.Client
}

func NewRepository(dynamo *dynamodb.Client) *Repository {
	return &Repository{Dynamo: dynamo}
}

func (r *Repository) GetUnique(Category, string) (Article, error) {
	return Article{}, nil
}
func (r *Repository) Insert(Article) (Article, error) {
	return Article{}, nil
}
func (r *Repository) Edit(Article) (Article, error) {
	return Article{}, nil
}
