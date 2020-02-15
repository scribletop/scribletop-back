package users_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/scribletop/scribletop-api/http/validation"
	"github.com/scribletop/scribletop-api/modules/users"
	"github.com/scribletop/scribletop-api/modules/users/mocks"
	"github.com/scribletop/scribletop-api/scribletop-apitest"
)

var _ = Describe("users.Controller", func() {
	var r *gin.Engine
	var w *httptest.ResponseRecorder
	var us *mocks.Service

	BeforeEach(func() {
		w, r = scribletop_apitest.SetupTestRouter()
		us = new(mocks.Service)
		c := users.NewUserController(us)
		c.RegisterRoutes(r.Group("/users"))
	})

	AfterEach(func() {
		us.AssertExpectations(GinkgoT())
	})

	Describe("Creating a user", func() {
		var req *http.Request
		var body []byte

		JustBeforeEach(func() {
			req, _ = http.NewRequest("POST", "/users/", bytes.NewBuffer(body))
			r.ServeHTTP(w, req)
			Expect(w.Result().Header.Get("content-type")).To(ContainSubstring("application/json"))
		})

		Context("With correct input", func() {
			BeforeEach(func() {
				body = []byte(`{"email":"joe@example.com","username":"joe","password":"password"}`)
			})

			Context("and successful response", func() {
				BeforeEach(func() {
					us.On("Create", users.UserWithPassword{
						User:     users.User{Tag: "joe", Email: "joe@example.com"},
						Password: "password",
					}).Return(users.User{Tag: "joe#1111", Email: "joe@example.com"}, nil)
				})

				It("should respond with a 201", func() {
					Expect(w.Code).To(Equal(201))
				})

				It("should have tag and email in response", func() {
					Expect(w.Body).To(MatchJSON(`{"tag": "joe#1111", "email": "joe@example.com"}`))
				})

				It("should not have password in response", func() {
					Expect(w.Body).NotTo(ContainSubstring("password"))
				})
			})

			Context("With all tags registered", func() {
				BeforeEach(func() {
					us.On("Create", users.UserWithPassword{
						User:     users.User{Tag: "joe", Email: "joe@example.com"},
						Password: "password",
					}).Return(users.User{}, errors.New("no candidate found"))
				})

				It("should tell him to be creative", func() {
					expected, _ := json.Marshal(validation.Error{
						Message: "Please verify your input.",
						Details: []validation.ErrorDetail{
							{"username", "Okay, be creative, 10000 people have the same username as you."},
						},
					})

					Expect(w.Code).To(Equal(422))
					Expect(w.Body).To(MatchJSON(expected))
				})
			})
		})

		Context("With small password", func() {
			BeforeEach(func() {
				body = []byte(`{"email":"joe@example.com","username":"joe","password":"pass"}`)
			})

			It("should respond with a 422", func() {
				Expect(w.Code).To(Equal(422))
			})

			It("should return an error with password too small", func() {
				expected, _ := json.Marshal(validation.Error{
					Message: "Please verify your input.",
					Details: []validation.ErrorDetail{
						{"password", "That password is too small!"},
					},
				})
				Expect(w.Body).To(MatchJSON(expected))
			})
		})

		Context("With empty input", func() {
			BeforeEach(func() {
				body = []byte(`{}`)
			})

			It("should respond with a 422", func() {
				Expect(w.Code).To(Equal(422))
			})

			It("should have a body with the missing fields", func() {
				expected, _ := json.Marshal(validation.Error{
					Message: "Please verify your input.",
					Details: []validation.ErrorDetail{
						{"username", "You need a username to register!"},
						{"email", "You need an email to register!"},
						{"password", "That password is too small!"},
					},
				})
				Expect(w.Body).To(MatchJSON(expected))
			})
		})
	})
})
