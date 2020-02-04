package users

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/scribletop/scribletop-api/http/controller"
	"github.com/scribletop/scribletop-api/http/validation"
	"github.com/scribletop/scribletop-api/shared"
	"gopkg.in/go-playground/validator.v9"
	"strings"
)

type userController struct {
	us UsersService
}

func NewUserController(us UsersService) controller.Controller {
	return &userController{us}
}

func (u *userController) RegisterRoutes(router *gin.RouterGroup) {
	router.POST("/", u.create)
}

type CreateUserRequest struct {
	Username string `json:"username" binding:"required,min=3"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"min=8"`
}

func (u *userController) create(c *gin.Context) {
	var json CreateUserRequest
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(422, validation.Error{
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
			c.JSON(422, validation.Error{
				Message: "Please verify your input.",
				Details: []validation.ErrorDetail{{
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

func (u *userController) validationToEnglish(err error) []validation.ErrorDetail {
	var details []validation.ErrorDetail
	for _, e := range err.(validator.ValidationErrors) {
		d := validation.ErrorDetail{Field: strings.ToLower(e.Field()), Error: ""}

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
