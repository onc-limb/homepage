package domain

import (
	"fmt"
	"io"
	"strconv"
)

type Category int

const (
	CLIMBING    Category = 1
	ENGINEERING Category = 2
	LIFE        Category = 3
)

func (c Category) String() string {
	switch c {
	case CLIMBING:
		return "クライミング"
	case ENGINEERING:
		return "エンジニアリング"
	case LIFE:
		return "生活"
	default:
		return fmt.Sprintf("Category(%d)", c)
	}
}

func (c Category) MarshalGQL(w io.Writer) {
	w.Write([]byte(strconv.Itoa(int(c))))
}

func (c *Category) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("Category must be a string")
	}

	switch str {
	case "CLIMBING":
		*c = CLIMBING
	case "ENGINEERING":
		*c = ENGINEERING
	case "LIFE":
		*c = LIFE
	default:
		return fmt.Errorf("invalid Category: %s", str)
	}
	return nil
}

func UnmarshalCategory(v interface{}) (Category, error) {
	str, ok := v.(string)
	if !ok {
		return 0, fmt.Errorf("Category must be a string")
	}

	switch str {
	case "クライミング":
		return CLIMBING, nil
	case "エンジニアリング":
		return ENGINEERING, nil
	case "生活":
		return LIFE, nil
	default:
		return 0, fmt.Errorf("invalid Category: %s", str)
	}
}
