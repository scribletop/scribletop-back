package database

import "time"

type BaseModel struct {
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"created_at"`
	DeletedAt time.Time `db:"created_at"`
}
