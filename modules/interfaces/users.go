package interfaces

import "github.com/scribletop/scribletop-api/modules/users"

type UsersRepository interface {
	FindByEmail(email string) (*users.UserWithPassword, error)
}

type UsersService interface {
	Create(user users.UserWithPassword) (users.User, error)
}

