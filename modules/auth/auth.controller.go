package auth

import (
	"fmt"
	"github.com/scribletop/scribletop-api/modules/interfaces"

	"github.com/gin-gonic/gin"
	"gopkg.in/go-playground/validator.v9"

	"github.com/scribletop/scribletop-api/http/controller"
	"github.com/scribletop/scribletop-api/http/errors"
)

type authController struct {
	as interfaces.AuthService
}

func NewAuthController(as interfaces.AuthService) controller.Controller {
	return &authController{as}
}

func (a *authController) RegisterRoutes(router *gin.RouterGroup) () {
	router.POST("/", a.create)
}

type createRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type createResponse struct {
	Jwt string `json:"jwt"`
}

func (a *authController) create(c *gin.Context) {
	var json createRequest
	if err := controller.ParseRequest(c, &json, a.validateCreate); err != nil {
		return
	}

	jwt, err := a.as.Authenticate(json.Email, json.Password)
	if err != nil {
		c.JSON(404, errors.Error{Message: "These credentials won't match in our database."})
		return
	}

	c.JSON(201, createResponse{Jwt: jwt})
}

func (a *authController) validateCreate(err validator.FieldError, f string) string {
	if err.Tag() == "required" {
		return fmt.Sprintf("Please fill your %s.", f)
	}

	panic("unhandled error message")
}
