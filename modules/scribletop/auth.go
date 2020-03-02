package scribletop

type AuthService interface {
	Authenticate(email, password string) (string, error)
}

