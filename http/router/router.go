package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/modules/auth"
	"github.com/scribletop/scribletop-api/modules/users"
	"github.com/scribletop/scribletop-api/shared"
)

func RegisterControllers(r *gin.Engine, db *sqlx.DB, c config.Config) {
	users.NewUserController(users.NewUsersService(db, shared.NewTagGenerator())).RegisterRoutes(r.Group("/users"))
	auth.NewAuthController(auth.NewAuthService(users.NewUsersRepository(db), c.Http)).RegisterRoutes(r.Group("/auth"))
}

func AddCors(r *gin.Engine, c config.HttpCorsConfig) {
	if c.Allow {
		mc := cors.DefaultConfig()
		mc.AllowOrigins = []string{c.Url}
		mc.AllowMethods = []string{"HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"}
		r.Use(cors.New(mc))
	}
}
