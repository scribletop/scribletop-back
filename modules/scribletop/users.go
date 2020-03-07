package scribletop

import (
	"github.com/scribletop/scribletop-api/database"
)

type UsersRepository interface {
	FindByEmail(email string) (*UserWithPassword, error)
	Validate(id int) error
	Delete(id int) error
}

type UsersService interface {
	Create(user UserWithPassword) (User, error)
}

type User struct {
	Tag       string `db:"tag" json:"tag"`
	Email     string `db:"email" json:"email"`
	Validated bool   `db:"validated" json:"-"`
	database.BaseModel
}

type UserWithPassword struct {
	User
	Password string `db:"password" json:"-"`
}
