package users

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	validation "github.com/scribletop/scribletop-api/http"
	"github.com/scribletop/scribletop-api/http/controller"
	"github.com/scribletop/scribletop-api/shared"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/go-playground/validator.v9"
	"math/rand"
	"strconv"
	"strings"
)

type userController struct {
	db *sqlx.DB
}

func NewUserController(db *sqlx.DB) controller.Controller {
	return &userController{db}
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

	hashed, err := bcrypt.GenerateFromPassword([]byte(json.Password), 10)
	if err != nil {
		panic(err)
	}

	if err = u.createUserInDB(rand.Intn(10000)+1, json, hashed); err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			if strings.Contains(err.Error(), "email") {
				c.JSON(201, "")
				return
			}

			if strings.Contains(err.Error(), "tag") {
				tag, err := u.findNotSoRandomTag(json.Username)
				if err != nil {
					if tag == -2 {
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

				if err = u.createUserInDB(tag, json, hashed); err != nil {
					if strings.Contains(err.Error(), "email") {
						c.JSON(201, "")
						return
					}

					c.JSON(500, err)
					return
				}
			}
		}

		c.JSON(500, err)
		return
	}

	c.JSON(201, "")
}

func (u *userController) createUserInDB(tag int, json CreateUserRequest, hashed []byte) error {
	_, err := u.db.NamedExec("INSERT INTO users (email, tag, password) VALUES (:email, :tag, :password)", &UserWithPassword{
		User: User{
			Tag:   fmt.Sprintf("%s#%04d", json.Username, tag),
			Email: json.Email,
		},
		Password: string(hashed),
	})
	return err
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

func (u *userController) findNotSoRandomTag(username string) (int, error) {
	availableTags := make(map[string]bool, 10000)
	for i := 1; i < 10000; i++ {
		availableTags[fmt.Sprintf("%04d", i)] = true
	}

	var unavailableTags []string
	err := u.db.Select(&unavailableTags, "SELECT RIGHT(tag, 4) FROM users WHERE tag LIKE $1", username+"#%")
	if err != nil {
		return -1, err
	}

	for _, tag := range unavailableTags {
		availableTags[tag] = false
	}

	var candidates []string
	for key, available := range availableTags {
		if available {
			candidates = append(candidates, key)
		}
	}

	if len(candidates) == 0 {
		return -2, errors.New("no suitable tag found")
	}

	return strconv.Atoi(candidates[rand.Intn(len(candidates))])
}
