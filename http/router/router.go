package router

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/modules/users"
	"github.com/scribletop/scribletop-api/shared"
)

func RegisterControllers(r *gin.Engine, db *sqlx.DB) {
	users.NewUserController(users.NewUsersService(db, shared.NewTagGenerator())).RegisterRoutes(r.Group("/users"))
}
