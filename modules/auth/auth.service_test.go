package auth_test

import (
	"database/sql"
	"encoding/base64"
	jwt "github.com/dgrijalva/jwt-go/v4"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/scribletop/scribletop-api/modules/auth"
	"github.com/scribletop/scribletop-api/modules/users"
	usersmocks "github.com/scribletop/scribletop-api/modules/users/mocks"
	"golang.org/x/crypto/bcrypt"
)

var _ = Describe("AuthService", func() {
	var ur *usersmocks.Repository
	var s auth.Service
	var res string
	var resErr error

	BeforeEach(func() {
		ur = new(usersmocks.Repository)
		s = auth.NewAuthService(ur, TestConfig.Http)
	})

	AfterEach(func() {
		ur.AssertExpectations(GinkgoT())
	})

	Context("authenticating", func() {
		var fbe1 *users.UserWithPassword
		var fbe2 error
		tag := "john#1111"
		email := "john@example.com"
		password := "password"

		JustBeforeEach(func() {
			p, _ := bcrypt.GenerateFromPassword([]byte(fbe1.Password), 1)
			fbe1.Password = string(p)
			ur.On("FindByEmail", email).Return(
				fbe1,
				fbe2,
			)

			res, resErr = s.Authenticate(email, password)
		})

		Context("with existing user", func() {
			Context("and valid password", func() {
				BeforeEach(func() {
					fbe1 = &users.UserWithPassword{Password: password, User: users.User{Email: email, Tag: tag}}
				})

				It("should create a valid JWT for the user", func() {
					Expect(resErr).NotTo(HaveOccurred())
					claims := auth.JwtClaims{}
					tkn, err := jwt.ParseWithClaims(res, &claims, func(token *jwt.Token) (interface{}, error) {
						pb, _ := base64.StdEncoding.DecodeString(TestConfig.Http.JwtPublic)
						return jwt.ParseRSAPublicKeyFromPEM(pb)
					}, jwt.WithAudience("scblta"))
					Expect(err).NotTo(HaveOccurred())
					Expect(tkn.Valid).To(BeTrue())
					Expect(claims.Tag).To(Equal(tag))
				})
			})

			Context("and invalid password", func() {
				BeforeEach(func() {
					fbe1 = &users.UserWithPassword{Password: "incorrect", User: users.User{Email: email, Tag: tag}}
				})

				It("should fail with ErrIncorrectPassword", func() {
					Expect(res).To(Equal(""))
					Expect(resErr).To(HaveOccurred())
					Expect(resErr).To(Equal(auth.ErrIncorrectPassword))
				})
			})
		})

		Context("with unknown user", func() {
			BeforeEach(func() {
				fbe2 = sql.ErrNoRows
			})

			It("should fail with ErrNoRows", func() {
				Expect(res).To(Equal(""))
				Expect(resErr).To(HaveOccurred())
				Expect(resErr).To(Equal(sql.ErrNoRows))
			})
		})
	})
})