package users

import (
	"database/sql"
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

func (r *repository) Validate(id int) error {
	re, err := r.db.Exec("UPDATE users SET validated = true WHERE id = $1", id)
	if err != nil {
		return err
	}

	ra, err := re.RowsAffected()
	if err != nil || ra == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *repository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
	return err
}
