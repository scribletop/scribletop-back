package shared

var anWords = make(map[string]bool)

func init() {
	anWords["email"] = true
}

func ToEnglish(field string) string {
	if _, ok := anWords[field]; ok {
		return "an " + field
	}

	return "a " + field
}
