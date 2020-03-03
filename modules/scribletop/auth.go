package scribletop

type AuthService interface {
	Authenticate(email, password string) (string, error)
}

type EmailValidationService interface {
	GenerateToken(email string) string
	Validate(email string, token string) error
}
