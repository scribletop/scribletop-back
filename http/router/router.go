package router

import (
	"github.com/gin-gonic/gin"
	"github.com/scribletop/scribletop-api/modules/users"
)

func RegisterControllers(r *gin.Engine) {
	users.NewUserController().RegisterRoutes(r.Group("/users"))
}
