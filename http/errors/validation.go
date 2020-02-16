package errors

type ValidationErrorDetail struct {
	Field string `json:"field"`
	Error string `json:"error"`
}

type ValidationError struct {
	Message string                  `json:"message"`
	Details []ValidationErrorDetail `json:"details"`
}
