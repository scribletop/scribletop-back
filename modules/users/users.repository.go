package users

import (
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/shared"
)

type Repository interface {
	Create(user User) (User, error)
}

type repository struct {
	db *sqlx.DB
	tg *shared.TagGenerator
}

func NewUsersRepository(db *sqlx.DB, tg *shared.TagGenerator) Repository {
	return &repository{db, tg}
}

func (r *repository) Create(user User) (User, error) {
	return User{}, nil
}

