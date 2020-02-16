package users

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"gopkg.in/go-playground/validator.v9"

	"github.com/scribletop/scribletop-api/http/controller"
	"github.com/scribletop/scribletop-api/http/errors"
	"github.com/scribletop/scribletop-api/shared"
)

type userController struct {
	us Service
}

func NewUserController(us Service) controller.Controller {
	return &userController{us}
}

func (u *userController) RegisterRoutes(router *gin.RouterGroup) {
	router.POST("/", u.create)
}

type createRequest struct {
	Username string `json:"username" binding:"required,min=3"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"min=8"`
}

func (u *userController) create(c *gin.Context) {
	var json createRequest
	if err := controller.ParseRequest(c, &json, u.validateCreate); err != nil {
		return
	}

	res, err := u.us.Create(UserWithPassword{
		Password: json.Password,
		User: User{
			Tag:   json.Username,
			Email: json.Email,
		},
	})

	if err != nil {
		if err.Error() == "no candidate found" {
			c.JSON(422, errors.ValidationError{
				Message: "Please verify your input.",
				Details: []errors.ValidationErrorDetail{{
					Field: "username",
					Error: "Okay, be creative, 10000 people have the same username as you.",
				}},
			})
			return
		}

		c.JSON(500, err)
		return
	}

	c.JSON(201, res)
}

func (u *userController) validationToEnglish(err error) []errors.ValidationErrorDetail {
	var details []errors.ValidationErrorDetail
	for _, e := range err.(validator.ValidationErrors) {
		d := errors.ValidationErrorDetail{Field: strings.ToLower(e.Field()), Error: ""}

		details = append(details, d)
	}

	return details
}

func (u *userController) validateCreate(err validator.FieldError, f string) string {
	if err.Tag() == "required" {
		return fmt.Sprintf("You need %s to register!", shared.ToEnglish(f))
	}

	if err.Tag() == "min" {
		return fmt.Sprintf("That %s is too small!", f)
	}

	if err.Tag() == "email" {
		return fmt.Sprintf("Your %s does not look like an email.", f)
	}

	panic("unhandled error message")
}
