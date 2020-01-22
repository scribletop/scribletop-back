package validation

type ErrorDetail struct {
	Field string `json:"field"`
	Error string `json:"error"`
}

type Error struct {
	Message string        `json:"message"`
	Details []ErrorDetail `json:"details"`
}
