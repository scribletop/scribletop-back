package auth_test

import (
	"crypto/sha512"
	"fmt"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"time"

	. "github.com/scribletop/scribletop-api/modules/scribletop"

	"github.com/scribletop/scribletop-api/modules/auth"
)

var _ = Describe("auth.EmailValidationService", func() {
	var v EmailValidationService
	salt := "salt"
	email := "john@example.com"
	t := time.Now()

	BeforeEach(func() {
		v = auth.NewEmailValidationService(salt, func() time.Time { return t })
	})

	It("generates a token correctly", func() {
		token := v.GenerateToken(email)
		n := fmt.Sprintf("%d", t.Add(time.Hour*24).UnixNano())
		Expect(token).To(Equal(fmt.Sprintf("%s%x", n, sha512.Sum512([]byte(n+email+salt)))))
	})

	It("validates a token correctly", func() {
		n := fmt.Sprintf("%d", t.Add(time.Hour*24).UnixNano())
		token := fmt.Sprintf("%s%x", n, sha512.Sum512([]byte(n+email+salt)))
		Expect(v.Validate(email, token)).NotTo(HaveOccurred())
	})

	It("fails on invalid tokens", func() {
		Expect(v.Validate(email, "")).To(Equal(auth.TokenInvalidError))
		Expect(v.Validate(email, "foo")).To(Equal(auth.TokenInvalidError))
		Expect(v.Validate(email, fmt.Sprintf("%s%x", "abcdefghijklmnopqrs", sha512.Sum512([]byte("foo"))))).To(Equal(auth.TokenInvalidError))
		Expect(v.Validate(email, fmt.Sprintf("%s%x", "2111111111111111111", sha512.Sum512([]byte("foo"))))).To(Equal(auth.TokenInvalidError))
	})

	It("fails on expired tokens", func() {
		Expect(v.Validate(email, fmt.Sprintf("%s%x", "1111111111111111111", sha512.Sum512([]byte("foo"))))).To(Equal(auth.TokenExpiredError))
	})
})
