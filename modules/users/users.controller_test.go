package users_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"net/http/httptest"
	"strings"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	validation "github.com/scribletop/scribletop-api/http"
	"github.com/scribletop/scribletop-api/modules/users"
	"github.com/scribletop/scribletop-api/scribletop-apitest"
)

var _ = Describe("Users.Controller", func() {
	var r *gin.Engine
	var w *httptest.ResponseRecorder

	BeforeEach(func() {
		w, r = scribletop_apitest.SetupTestRouter()
		c := users.NewUserController(TestDB)
		c.RegisterRoutes(r.Group("/users"))
	})

	AfterEach(func() {
		TestDB.MustExec("TRUNCATE TABLE users")
	})

	Describe("Creating a user", func() {
		var req *http.Request
		var body []byte

		JustBeforeEach(func() {
			req, _ = http.NewRequest("POST", "/users/", bytes.NewBuffer(body))
			r.ServeHTTP(w, req)
			Expect(w.Result().Header.Get("content-type")).To(ContainSubstring("application/json"))
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

		Context("With correct input", func() {
			BeforeEach(func() {
				body = []byte(`{"email":"joe@example.com","username":"joe","password":"password"}`)
			})

			It("should respond with a 201", func() {
				Expect(w.Code).To(Equal(201))
			})

			It("should create an user in the database", func() {
				res, _ := TestDB.Query("SELECT * FROM users WHERE email = $1 AND tag LIKE $2", "joe@example.com", "joe%")
				Expect(res.Next()).To(BeTrue())
			})

			It("should hash the password", func() {
				var password string
				_ = TestDB.Get(&password, "SELECT password FROM users")
				Expect(password).NotTo(Equal("password"))
				Expect(bcrypt.CompareHashAndPassword([]byte(password), []byte("password"))).To(BeNil())
			})

			It("should generate a tag for the user", func() {
				var tag string
				_ = TestDB.Get(&tag, "SELECT tag FROM users")
				Expect(tag).To(MatchRegexp("^joe#[0-9]{4}$"))
			})

			Context("With an already registered email", func() {
				BeforeEach(func() {
					_, _ = TestDB.Exec("INSERT INTO users (email, tag, password) VALUES ($1, $2, $3)", "joe@example.com", "joe#1111", "")
				})

				It("should not fail", func() {
					Expect(w.Code).To(Equal(201))
				})
			})

			Context("With all tags registered", func() {
				BeforeEach(func() {
					query := make([]string, 10000)
					for i := 0; i < 10000; i++ {
						query = append(
							query,
							fmt.Sprintf("INSERT INTO users (email, tag, password) VALUES ('joe%04d.example.com', 'joe#%04d', '')", i, i),
						)
					}

					TestDB.MustExec(strings.Join(query, ";"))
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
	})
})
