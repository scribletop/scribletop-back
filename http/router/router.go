package router

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/modules/users"
)

func RegisterControllers(r *gin.Engine, db *sqlx.DB) {
	users.NewUserController(db).RegisterRoutes(r.Group("/users"))
}
