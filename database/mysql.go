package database

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/config"
)

func Connect(config config.DatabaseConfig) (*sqlx.DB, error) {
	return sqlx.Connect(
		"mysql",
		config.Username+":"+config.Password+"@("+config.Hostname+")/"+config.Database+"?charset=utf8&parseTime=True&loc=Local",
	)
}
