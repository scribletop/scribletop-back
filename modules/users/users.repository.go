package users

import (
	"github.com/jmoiron/sqlx"
)

type Repository interface {
	FindByEmail(tag string) (*UserWithPassword, error)
}

type repository struct {
	db *sqlx.DB
}

func NewUsersRepository(db *sqlx.DB) Repository {
	return &repository{db}
}

func (r *repository) FindByEmail(email string) (*UserWithPassword, error) {
	var u UserWithPassword
	if err := r.db.Get(&u, "SELECT * FROM users WHERE email = $1", email); err != nil {
		return nil, err
	}

	return &u, nil
}
