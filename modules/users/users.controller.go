package users

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/http/controller"
)

type userController struct {
	db *sqlx.DB
}

func NewUserController(db *sqlx.DB) controller.Controller {
	return userController{db}
}

func (u userController) RegisterRoutes(router *gin.RouterGroup) {
	router.POST("/", u.create)
}

func (u userController) create(c *gin.Context) {
	c.JSON(201, nil)
}
