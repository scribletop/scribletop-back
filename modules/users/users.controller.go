package users

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	validation "github.com/scribletop/scribletop-api/http"
	"github.com/scribletop/scribletop-api/http/controller"
	"github.com/scribletop/scribletop-api/text"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/go-playground/validator.v9"
	"math/rand"
	"strings"
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

type CreateUserRequest struct {
	Username string `json:"username" binding:"required,min=3"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"min=8"`
}

func (u userController) create(c *gin.Context) {
	var json CreateUserRequest
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(422, validation.Error{
			Message: "Please verify your input.",
			Details: u.validationToEnglish(err),
		})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(json.Password), 10)
	if err != nil {
		panic(err)
	}

	u.db.NamedExec("INSERT INTO users (email, tag, password) VALUES (:email, :tag, :password)", &UserWithPassword{
		User: User{
			Tag:   fmt.Sprintf("%s#%04d", json.Username, rand.Int() % 10000 + 1),
			Email: json.Email,
		},
		Password: string(hashed),
	})

	c.JSON(201, "")
}

func (u userController) validationToEnglish(err error) []validation.ErrorDetail {
	var details []validation.ErrorDetail
	for _, e := range err.(validator.ValidationErrors) {
		d := validation.ErrorDetail{Field: strings.ToLower(e.Field()), Error: ""}

		if e.Tag() == "required" {
			d.Error = fmt.Sprintf("You need %s to register!", text.ToEnglish(d.Field))
		}

		if e.Tag() == "min" {
			d.Error = fmt.Sprintf("That %s is too small!", d.Field)
		}

		details = append(details, d)
	}

	return details
}
