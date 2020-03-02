package auth_test

import (
	"database/sql"
	"encoding/base64"

	"github.com/dgrijalva/jwt-go/v4"
	"golang.org/x/crypto/bcrypt"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/scribletop/scribletop-api/modules/auth"
	"github.com/scribletop/scribletop-api/modules/scribletop"

	mocks "github.com/scribletop/scribletop-api/mocks/modules/scribletop"
)

var _ = Describe("AuthService", func() {
	var ur *mocks.UsersRepository
	var s scribletop.AuthService
	var res string
	var resErr error

	BeforeEach(func() {
		ur = new(mocks.UsersRepository)
		s = auth.NewAuthService(ur, TestConfig.Http)
	})

	AfterEach(func() {
		ur.AssertExpectations(GinkgoT())
	})

	Context("authenticating", func() {
		var fbe1 *scribletop.UserWithPassword
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
					fbe1 = &scribletop.UserWithPassword{Password: password, User: scribletop.User{Email: email, Tag: tag}}
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
					fbe1 = &scribletop.UserWithPassword{Password: "incorrect", User: scribletop.User{Email: email, Tag: tag}}
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
