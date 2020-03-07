package auth

import "C"
import (
	"fmt"

	"github.com/gin-gonic/gin"
	"gopkg.in/go-playground/validator.v9"

	. "github.com/scribletop/scribletop-api/modules/scribletop"

	"github.com/scribletop/scribletop-api/http/controller"
	"github.com/scribletop/scribletop-api/http/errors"
)

type authController struct {
	as AuthService
}

func NewAuthController(as AuthService) controller.Controller {
	return &authController{as}
}

func (a *authController) RegisterRoutes(router *gin.RouterGroup) () {
	router.POST("/", a.authenticate)
	router.POST("/email-validation", a.emailValidation)
}

type createRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type createResponse struct {
	Jwt string `json:"jwt"`
}

func (a *authController) authenticate(c *gin.Context) {
	var json createRequest
	if err := controller.ParseRequest(c, &json, a.validateAuthenticate); err != nil {
		return
	}

	jwt, err := a.as.Authenticate(json.Email, json.Password)
	if err != nil {
		c.JSON(404, errors.Error{Message: "These credentials won't match in our database."})
		return
	}

	c.JSON(201, createResponse{Jwt: jwt})
}

func (a *authController) validateAuthenticate(err validator.FieldError, f string) string {
	if err.Tag() == "required" {
		return fmt.Sprintf("Please fill your %s.", f)
	}

	panic("unhandled error message")
}

type emailValidationRequest struct {
	Email string `json:"email" binding:"required"`
	Token string `json:"token" binding:"required"`
}

func (a *authController) emailValidation(c *gin.Context) {
	var json emailValidationRequest
	if err := controller.ParseRequest(c, &json, a.validateEmailValidation); err != nil {
		return
	}

	if err := a.as.Validate(json.Email, json.Token); err != nil {
		switch err {
		case ErrTokenExpired:
			c.JSON(403, errors.Error{
				Message: "This token has expired, which basically means your account does not exist anymore. Feel free to authenticate a new one!"})
			break
		case ErrTokenInvalid:
			c.JSON(403, errors.Error{
				Message: "This token is invalid. This incident will be reported. Right?",
			})
		}
	} else {
		c.JSON(204, nil)
	}
}

func (a *authController) validateEmailValidation(_ validator.FieldError, name string) string {
	return fmt.Sprintf("The field %s is required.", name)
}
