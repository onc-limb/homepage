// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
	"time"
)

type Article struct {
	ID           int        `json:"id"`
	PageID       string     `json:"pageId"`
	Title        string     `json:"title"`
	Contents     []*Content `json:"Contents"`
	FeaturePoint int        `json:"featurePoint"`
	IsPublished  bool       `json:"isPublished"`
	CreatedAt    time.Time  `json:"createdAt"`
	EditedAt     time.Time  `json:"EditedAt"`
}

type Content struct {
	ID           int    `json:"id"`
	ArticleID    int    `json:"articleId"`
	Order        int    `json:"order"`
	Type         string `json:"type"`
	Text         string `json:"text"`
	Bold         bool   `json:"bold"`
	Italic       bool   `json:"italic"`
	StrikThrough bool   `json:"strikThrough"`
	UnderLine    bool   `json:"underLine"`
	Code         bool   `json:"code"`
}

type EditArticle struct {
	ID       int       `json:"id"`
	Title    *string   `json:"title,omitempty"`
	Content  *string   `json:"content,omitempty"`
	Category *Category `json:"category,omitempty"`
}

type Mutation struct {
}

type NotionPage struct {
	PageID *string `json:"pageId,omitempty"`
}

type Query struct {
}

type Category string

const (
	CategoryClimbing    Category = "CLIMBING"
	CategoryEngineering Category = "ENGINEERING"
	CategoryLife        Category = "LIFE"
)

var AllCategory = []Category{
	CategoryClimbing,
	CategoryEngineering,
	CategoryLife,
}

func (e Category) IsValid() bool {
	switch e {
	case CategoryClimbing, CategoryEngineering, CategoryLife:
		return true
	}
	return false
}

func (e Category) String() string {
	return string(e)
}

func (e *Category) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Category(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Category", str)
	}
	return nil
}

func (e Category) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
