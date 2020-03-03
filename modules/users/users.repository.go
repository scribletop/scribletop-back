package users

import (
	"github.com/jmoiron/sqlx"

	. "github.com/scribletop/scribletop-api/modules/scribletop"
)

type repository struct {
	db *sqlx.DB
}

func NewUsersRepository(db *sqlx.DB) UsersRepository {
	return &repository{db}
}

func (r *repository) FindByEmail(email string) (*UserWithPassword, error) {
	var u UserWithPassword
	if err := r.db.Get(&u, "SELECT * FROM users WHERE email = $1", email); err != nil {
		return nil, err
	}

	return &u, nil
}
