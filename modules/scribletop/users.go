package scribletop

import (
	"github.com/scribletop/scribletop-api/database"
)

type UsersRepository interface {
	FindByEmail(email string) (*UserWithPassword, error)
}

type UsersService interface {
	Create(user UserWithPassword) (User, error)
}

type UserWithPassword struct {
	Password string `db:"password"`
	User
}

type User struct {
	Tag   string `db:"tag" json:"tag"`
	Email string `db:"email" json:"email"`
	database.BaseModel
}

