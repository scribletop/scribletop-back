package database

import (
	"time"
)

type BaseModel struct {
	CreatedAt *time.Time `db:"created_at" json:"created_at,omitempty"`
	UpdatedAt *time.Time `db:"updated_at" json:"updated_at,omitempty"`
	DeletedAt *time.Time `db:"updated_at" json:"deleted_at,omitempty"`
}
