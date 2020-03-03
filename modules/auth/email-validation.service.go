package auth

import (
	"crypto/sha512"
	"errors"
	"fmt"
	. "github.com/scribletop/scribletop-api/modules/scribletop"
	"strconv"
	"time"
)

type emailValidationService struct {
	hashSalt string
	nowFunc  func() time.Time
}

var TokenExpiredError = errors.New("email validation: token expired")
var TokenInvalidError = errors.New("email validation: token invalid")

func NewEmailValidationService(hashSalt string, nowFunc func() time.Time) EmailValidationService {
	return &emailValidationService{hashSalt, nowFunc}
}

func (e *emailValidationService) GenerateToken(email string) string {
	t := fmt.Sprintf("%d", e.nowFunc().Add(time.Hour*24).UnixNano())
	return fmt.Sprintf("%s%x", t, sha512.Sum512([]byte(t+email+e.hashSalt)))
}

func (e *emailValidationService) Validate(email string, token string) error {
	if len(token) != 147 {
		return TokenInvalidError
	}

	nss := token[:19]
	ns, err := strconv.ParseInt(nss, 10, 64)
	if err != nil {
		return TokenInvalidError
	}

	t := time.Unix(0, ns)
	if e.nowFunc().After(t) {
		return TokenExpiredError
	}

	if fmt.Sprintf("%s%x", nss, sha512.Sum512([]byte(nss+email+e.hashSalt))) != token {
		return TokenInvalidError
	}

	return nil
}
