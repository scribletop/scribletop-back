package users_test

import (
	"github.com/gin-gonic/gin"
	"github.com/scribletop/scribletop-api/modules/users"
	"github.com/scribletop/scribletop-api/scribletop-apitest"
	"net/http"
	"net/http/httptest"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Users.Controller", func() {
	c := users.NewUserController(TestDB)
	var r *gin.Engine
	var w *httptest.ResponseRecorder

	BeforeEach(func() {
		w, r = scribletop_apitest.SetupTestRouter()
		c.RegisterRoutes(r.Group("/users"))
	})

	Describe("Creating a user", func() {
		var req *http.Request
		JustBeforeEach(func() {
			r.ServeHTTP(w, req)
		})

		Context("With correct input", func() {
			BeforeEach(func() {
				req, _ = http.NewRequest("POST", "/users/", nil)
			})

			It("should respond with a 201", func() {
				Expect(w.Code).To(Equal(201))
			})
		})
	})
})
