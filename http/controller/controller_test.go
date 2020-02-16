package controller_test

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"gopkg.in/go-playground/validator.v9"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/scribletop/scribletop-api/http/controller"
	scribletop_errors "github.com/scribletop/scribletop-api/http/errors"
)

type userRequest struct {
	Username string `json:"username" binding:"required"`
}

func v(err validator.FieldError) string {
	return "bad"
}

var _ = Describe("Controller", func() {
	Describe("ParseRequest", func() {
		var w *httptest.ResponseRecorder
		var c *gin.Context

		JustBeforeEach(func() {
			w = httptest.NewRecorder()
			c, _ = gin.CreateTestContext(w)
		})

		Context("with nil target or nil validation function", func() {
			It("should panic", func() {
				Expect(func() { _ = controller.ParseRequest(c, nil, v) }).To(Panic())
				Expect(func() { _ = controller.ParseRequest(c, "", nil) }).To(Panic())
			})
		})

		Context("with invalid json", func() {
			It("should return 400", func() {
				c.Request = httptest.NewRequest("POST", "/", bytes.NewBufferString(""))
				Expect(controller.ParseRequest(c, userRequest{}, v)).To(HaveOccurred())
				Expect(w.Code).To(Equal(400))
			})

			It("should return 400", func() {
				c.Request = httptest.NewRequest("POST", "/", bytes.NewBufferString("{"))
				Expect(controller.ParseRequest(c, userRequest{}, v)).To(HaveOccurred())
				Expect(w.Code).To(Equal(400))
			})
		})

		Context("with incorrect binding", func() {
			It("should return 422", func() {
				c.Request = httptest.NewRequest("POST", "/", bytes.NewBufferString("{}"))
				Expect(controller.ParseRequest(c, &userRequest{}, v)).To(HaveOccurred())
				Expect(w.Code).To(Equal(422))
			})
		})

		Context("with incorrect validation", func() {
			It("should return 422", func() {
				expected, _ := json.Marshal(scribletop_errors.ValidationError{
					Message: "Please verify your input.",
					Details: []scribletop_errors.ValidationErrorDetail{
						{"username", "bad"},
					},
				})

				c.Request = httptest.NewRequest("POST", "/", bytes.NewBufferString(`{"username": ""}`))
				Expect(controller.ParseRequest(c, &userRequest{}, v)).To(HaveOccurred())
				Expect(w.Code).To(Equal(422))
				Expect(w.Body).To(MatchJSON(expected))
			})
		})
	})
})
