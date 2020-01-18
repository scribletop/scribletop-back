package database

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/scribletop/scribletop-api/config"
)

func Connect(config config.DatabaseConfig) (*gorm.DB, error) {
	return gorm.Open(
		"mysql",
		config.Username+":"+config.Password+"@("+config.Hostname+")/"+config.Database+"?charset=utf8&parseTime=True&loc=Local",
	)
}
