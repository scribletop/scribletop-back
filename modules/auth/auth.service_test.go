package auth_test

import (
	"database/sql"
	"encoding/base64"
	"github.com/scribletop/scribletop-api/database"

	"github.com/dgrijalva/jwt-go/v4"
	"golang.org/x/crypto/bcrypt"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "github.com/scribletop/scribletop-api/modules/scribletop"

	"github.com/scribletop/scribletop-api/modules/auth"

	mocks "github.com/scribletop/scribletop-api/mocks/modules/scribletop"
)

var _ = Describe("AuthService", func() {
	var ur *mocks.UsersRepository
	var ev *mocks.EmailValidator
	var s AuthService

	BeforeEach(func() {
		ur = new(mocks.UsersRepository)
		ev = new(mocks.EmailValidator)
		s = auth.NewAuthService(ur, ev, TestConfig.Http)
	})

	AfterEach(func() {
		ur.AssertExpectations(GinkgoT())
		ev.AssertExpectations(GinkgoT())
	})

	Context("authenticating", func() {
		var res string
		var resErr error
		var fbe1 *UserWithPassword
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
					fbe1 = &UserWithPassword{Password: password, User: User{Email: email, Tag: tag}}
				})

				It("should authenticate a valid JWT for the user", func() {
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
					fbe1 = &UserWithPassword{Password: "incorrect", User: User{Email: email, Tag: tag}}
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

	Context("validating an email", func() {
		var token string
		var email string
		var err error
		var fbe1 *UserWithPassword
		var fbe2 error

		JustBeforeEach(func() {
			ur.On("FindByEmail", email).Return(
				fbe1,
				fbe2,
			)
			err = s.Validate(email, token)
		})

		Context("with an existing user", func() {
			Context("and a valid token", func() {
				BeforeEach(func() {
					token = "valid"
					email = "valid@example.com"
					ev.On("Validate", email, token).Return(nil)
				})

				Context("and the user is not validated", func () {
					BeforeEach(func () {
						fbe1 = &UserWithPassword{User: User{BaseModel: database.BaseModel{Id: 1}, Validated: false}}
						ur.On("Validate", 1).Return(nil)
					})
					It("returns nil", func() { Expect(err).To(BeNil()) })
				})

				Context("and the user is already validated", func () {
					BeforeEach(func () { fbe1 = &UserWithPassword{User: User{Validated: true}}})
					It("returns an already validated error", func() {
						Expect(err).To(HaveOccurred())
						Expect(err).To(Equal(auth.ErrAlreadyValidated))
					})
				})
			})

			Context("and an invalid token", func() {
				BeforeEach(func() {
					token = "invalid"
					email = "valid@example.com"
					ev.On("Validate", email, token).Return(auth.ErrTokenInvalid)
				})

				It("returns a ErrTokenInvalid", func() {
					Expect(err).To(HaveOccurred())
					Expect(err).To(Equal(auth.ErrTokenInvalid))
				})
			})

			Context("and an expired token", func() {
				Context("on a already valid user", func () {
					BeforeEach(func() {
						token = "expired"
						email = "valid@example.com"
						ev.On("Validate", email, token).Return(auth.ErrTokenExpired)
						fbe1 = &UserWithPassword{User: User{BaseModel: database.BaseModel{Id: 1}, Validated: true}}
					})

					It("returns a ErrTokenExpired", func() {
						Expect(err).To(HaveOccurred())
						Expect(err).To(Equal(auth.ErrTokenExpired))
					})
				})

				Context("on a invalidated email", func () {
					BeforeEach(func() {
						token = "expired"
						email = "invalid@example.com"
						ev.On("Validate", email, token).Return(auth.ErrTokenExpired)
						fbe1 = &UserWithPassword{User: User{BaseModel: database.BaseModel{Id: 1}, Validated: false}}
						ur.On("Delete", 1).Return(nil)
					})

					It("returns a ErrTokenExpired", func() {
						Expect(err).To(HaveOccurred())
						Expect(err).To(Equal(auth.ErrTokenExpired))
					})
				})
			})
		})

		Context("with an invalid user", func() {
			BeforeEach(func() {
				email = "invalid@example.com"
				fbe2 = sql.ErrNoRows
			})

			It("returns ErrTokenInvalid", func() {
				Expect(err).To(HaveOccurred())
				Expect(err).To(Equal(auth.ErrTokenExpired))
			})
		})
	})
})
