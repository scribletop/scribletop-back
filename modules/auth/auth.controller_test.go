package auth_test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	scribletoperrors "github.com/scribletop/scribletop-api/http/errors"
	"github.com/scribletop/scribletop-api/modules/auth"
	"github.com/scribletop/scribletop-api/scribletop-apitest"

	mocks "github.com/scribletop/scribletop-api/mocks/modules/scribletop"
)

var _ = Describe("auth.Controller", func() {
	var r *gin.Engine
	var w *httptest.ResponseRecorder
	var as *mocks.AuthService

	BeforeEach(func() {
		w, r = scribletop_apitest.SetupTestRouter()
		as = new(mocks.AuthService)
		c := auth.NewAuthController(as)
		c.RegisterRoutes(r.Group("/auth"))
	})

	AfterEach(func() { as.AssertExpectations(GinkgoT()) })

	Describe("authenticating a user", func() {
		var req *http.Request
		var email string
		var password string

		JustBeforeEach(func() {
			req, _ = http.NewRequest("POST", "/auth/", bytes.NewBuffer([]byte(
				fmt.Sprintf(`{"email": "%s", "password": "%s"}`, email, password),
			)))
			r.ServeHTTP(w, req)
			Expect(w.Result().Header.Get("content-type")).To(ContainSubstring("application/json"))
		})

		Context("with correct input", func() {
			email = "foo@example.com"
			password = "password"

			BeforeEach(func() { as.On("Authenticate", email, password).Return("jwt", nil) })
			It("should respond with a 201", func() { Expect(w.Code).To(Equal(201)) })
			It("should return a JWT", func() { Expect(w.Body).To(MatchJSON(`{"jwt": "jwt"}`)) })
		})

		Context("with incorrect input", func() {
			expected, _ := json.Marshal(scribletoperrors.Error{
				Message: "These credentials won't match in our database.",
			})

			BeforeEach(func() {
				email = "foo"
				password = "bar"
			})

			Context("email not found", func() {
				BeforeEach(func() { as.On("Authenticate", email, password).Return("", sql.ErrNoRows) })
				It("should return a 404", func() { Expect(w.Code).To(Equal(404)) })
				It("should show an error message user not found", func() { Expect(w.Body).To(MatchJSON(expected)) })
			})

			Context("invalid password", func() {
				BeforeEach(func() { as.On("Authenticate", email, password).Return("", auth.ErrIncorrectPassword) })
				It("should return a 404", func() { Expect(w.Code).To(Equal(404)) })
				It("should show an error message user not found", func() { Expect(w.Body).To(MatchJSON(expected)) })
			})

			Context("invalid json", func() {
				BeforeEach(func() { email = "\"" })
				It("should return a 400", func() { Expect(w.Code).To(Equal(400)) })
			})
		})
	})
})
