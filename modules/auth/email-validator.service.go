package auth

import (
	"crypto/sha512"
	"errors"
	"fmt"
	"strconv"
	"time"

	. "github.com/scribletop/scribletop-api/modules/scribletop"
)

type emailValidator struct {
	hashSalt string
	nowFunc  func() time.Time
}

var ErrTokenExpired = errors.New("email validator: token expired")
var ErrTokenInvalid = errors.New("email validator: token invalid")

func NewEmailValidator(hashSalt string, nowFunc func() time.Time) EmailValidator {
	return &emailValidator{hashSalt, nowFunc}
}

func (e *emailValidator) GenerateToken(email string) string {
	t := fmt.Sprintf("%d", e.nowFunc().Add(time.Hour*24).UnixNano())
	return fmt.Sprintf("%s%x", t, sha512.Sum512([]byte(t+email+e.hashSalt)))
}

func (e *emailValidator) Validate(email string, token string) error {
	if len(token) != 147 {
		return ErrTokenInvalid
	}

	nss := token[:19]
	ns, err := strconv.ParseInt(nss, 10, 64)
	if err != nil {
		return ErrTokenInvalid
	}

	t := time.Unix(0, ns)
	if e.nowFunc().After(t) {
		return ErrTokenExpired
	}

	if fmt.Sprintf("%s%x", nss, sha512.Sum512([]byte(nss+email+e.hashSalt))) != token {
		return ErrTokenInvalid
	}

	return nil
}
