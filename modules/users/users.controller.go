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
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(422, errors.ValidationError{
			Message: "Please verify your input.",
			Details: u.validationToEnglish(err),
		})
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

		if e.Tag() == "required" {
			d.Error = fmt.Sprintf("You need %s to register!", shared.ToEnglish(d.Field))
		}

		if e.Tag() == "min" {
			d.Error = fmt.Sprintf("That %s is too small!", d.Field)
		}

		details = append(details, d)
	}

	return details
}
