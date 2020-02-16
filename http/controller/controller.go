package controller

import (
	"strings"

	"github.com/gin-gonic/gin"
	"gopkg.in/go-playground/validator.v9"

	"github.com/scribletop/scribletop-api/http/errors"
)

type Controller interface {
	RegisterRoutes(router *gin.RouterGroup) ()
}

func ParseRequest(
	c *gin.Context,
	target interface{},
	translateFunc func(err validator.FieldError, fieldName string) string,
) error {
	err := c.ShouldBindJSON(target)
	if err == nil {
		return nil
	}

	if target == nil || translateFunc == nil {
		panic("ParseRequest target is nil!")
	}

	if verr, ok := err.(validator.ValidationErrors); ok {
		var details []errors.ValidationErrorDetail
		for _, e := range verr {
			d := errors.ValidationErrorDetail{Field: strings.ToLower(e.Field()), Error: ""}
			d.Error = translateFunc(e, d.Field)
			details = append(details, d)
		}

		c.JSON(422, errors.ValidationError{
			Message: "Please verify your input.",
			Details: details,
		})
	} else {
		c.JSON(400, errors.Error{Message: "Your request must be JSON."})
	}

	return err
}
