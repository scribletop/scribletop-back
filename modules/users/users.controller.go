package users

import (
	"github.com/gin-gonic/gin"
	"github.com/scribletop/scribletop-api/http/controller"
)

type userController struct {
}

func NewUserController() controller.Controller {
	return userController{}
}

func (u userController) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/ping", u.ping)
}

func (u userController) ping(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}
