package scribletop

type AuthService interface {
	Authenticate(email, password string) (string, error)
	Validate(email string, token string) error
}

type EmailValidator interface {
	GenerateToken(email string) string
	Validate(email string, token string) error
}
