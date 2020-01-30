package auth_test

import (
	"encoding/base64"
	jwt "github.com/dgrijalva/jwt-go/v4"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/scribletop/scribletop-api/modules/auth"
	usersmocks "github.com/scribletop/scribletop-api/modules/users/mocks"
)

var _ = Describe("AuthService", func() {
	var us *usersmocks.Service
	var s auth.Service
	var res string
	var resErr error

	BeforeEach(func() {
		us = new(usersmocks.Service)
		s = auth.NewAuthService(us, TestConfig.Http)
	})

	AfterEach(func() {
		us.AssertExpectations(GinkgoT())
		TestDB.MustExec("TRUNCATE TABLE users")
	})

	JustBeforeEach(func() {
		res, resErr = s.Authenticate()
	})

	Context("authenticating", func() {
		Context("with existing user", func() {
			Context("and valid password", func() {
				It("should create a valid JWT for the user", func() {
					Expect(resErr).NotTo(HaveOccurred())
					claims := auth.JwtClaims{}
					tkn, err := jwt.ParseWithClaims(res, &claims, func(token *jwt.Token) (interface{}, error) {
						pb, _ := base64.StdEncoding.DecodeString(TestConfig.Http.JwtPublic)
						return jwt.ParseRSAPublicKeyFromPEM(pb)
					}, jwt.WithAudience("scblta"))
					Expect(err).NotTo(HaveOccurred())
					Expect(tkn.Valid).To(BeTrue())
					Expect(claims.Tag).To(Equal("john#1111"))
				})
			})
		})
	})
})
