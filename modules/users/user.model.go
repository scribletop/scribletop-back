package users

import "github.com/scribletop/scribletop-api/database"

type User struct {
	Tag string `db:"tag"`
	Email string `db:"email"`
	database.BaseModel
}

type UserWithPassword struct {
	Password string `db:"password"`
	User
}
