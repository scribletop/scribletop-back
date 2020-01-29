//go:generate mockery -all -output ./mocks

package shared

import (
	"errors"
	"fmt"
	"math"
	"math/rand"
)

type TagGenerator interface {
	Random(chars int) string
	RandomExcept(chars int, unavailable []string) (string, error)
}

type generator struct{}

func NewTagGenerator() TagGenerator {
	return &generator{}
}

func (g *generator) Random(chars int) string {
	return fmt.Sprintf(
		fmt.Sprintf("%%0%dd", chars),
		rand.Intn(int(0.5+math.Pow10(chars)))+1,
	)
}

func (g *generator) RandomExcept(chars int, unavailable []string) (string, error) {
	max := int(0.5 + math.Pow10(chars))
	availableTags := make(map[string]bool, max)
	for i := 1; i < max; i++ {
		availableTags[fmt.Sprintf(fmt.Sprintf("%%0%dd", chars), i)] = true
	}

	for _, tag := range unavailable {
		availableTags[tag] = false
	}

	var candidates []string
	for key, available := range availableTags {
		if available {
			candidates = append(candidates, key)
		}
	}

	if len(candidates) == 0 {
		return "", errors.New("no candidate found")
	}

	return candidates[rand.Intn(len(candidates))], nil
}
