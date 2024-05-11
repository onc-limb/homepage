package domain

type Content struct {
	Type        string
	Annotations Annotation
	Text        string
}

type Annotation struct {
	Bold         bool
	Italic       bool
	StrikThrough bool
	UnderLine    bool
	Code         bool
}
