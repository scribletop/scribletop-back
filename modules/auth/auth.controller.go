package auth

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/scribletop/scribletop-api/http/controller"
	"github.com/scribletop/scribletop-api/http/errors"
	"gopkg.in/go-playground/validator.v9"
)

type authController struct {
	as Service
}

func NewAuthController(as Service) controller.Controller {
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
	}

	c.JSON(201, createResponse{Jwt: jwt})
}

func (u *authController) validateCreate(err validator.FieldError) string {
	if err.Tag() == "required" {
		return fmt.Sprintf("Please fill your %s.", err.Field())
	}

	panic("unhandled error message")
}
