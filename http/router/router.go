package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/modules/users"
	"github.com/scribletop/scribletop-api/shared"
)

func RegisterControllers(r *gin.Engine, db *sqlx.DB) {
	users.NewUserController(users.NewUsersService(db, shared.NewTagGenerator())).RegisterRoutes(r.Group("/users"))
}

func AddCors(r *gin.Engine, c config.HttpCorsConfig) {
	if c.Allow {
		mc := cors.DefaultConfig()
		mc.AllowOrigins = []string{c.Url}
		mc.AllowMethods = []string{"HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"}
		r.Use(cors.New(mc))
	}
}
