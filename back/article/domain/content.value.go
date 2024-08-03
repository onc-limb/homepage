package domain

type Content struct {
	ID           uint
	ArticleID    uint
	Order        uint
	Type         string
	Text         string
	Bold         bool
	Italic       bool
	StrikThrough bool
	UnderLine    bool
	Code         bool
}
