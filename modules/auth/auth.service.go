package auth

import (
	"crypto/rsa"
	"encoding/base64"
	"errors"
	"github.com/scribletop/scribletop-api/modules/interfaces"
	"time"

	"github.com/dgrijalva/jwt-go/v4"
	"golang.org/x/crypto/bcrypt"

	"github.com/scribletop/scribletop-api/config"
)

type jwtConfig struct {
	JwtPublic  *rsa.PublicKey
	JwtPrivate *rsa.PrivateKey
}

type JwtClaims struct {
	jwt.StandardClaims
	Tag string `json:"tag,omitempty"`
}

type service struct {
	c  jwtConfig
	ur interfaces.UsersRepository
}

var ErrIncorrectPassword = errors.New("auth: incorrect password")

func NewAuthService(ur interfaces.UsersRepository, c config.HttpConfig) interfaces.AuthService {
	pb, _ := base64.StdEncoding.DecodeString(c.JwtPublic)
	pv, _ := base64.StdEncoding.DecodeString(c.JwtPrivate)
	public, err := jwt.ParseRSAPublicKeyFromPEM(pb)
	if err != nil {
		panic(err)
	}

	private, err := jwt.ParseRSAPrivateKeyFromPEM(pv)
	if err != nil {
		panic(err)
	}

	return &service{jwtConfig{
		JwtPublic:  public,
		JwtPrivate: private,
	}, ur}
}

func (s *service) Authenticate(email, password string) (string, error) {
	u, err := s.ur.FindByEmail(email)
	if err != nil {
		return "", err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
		return "", ErrIncorrectPassword
	}

	claims := JwtClaims{
		StandardClaims: jwt.StandardClaims{
			Audience: []string{"scblta"},
			ExpiresAt: &jwt.Time{
				Time: time.Now().Add(time.Hour),
			},
		},
		Tag: u.Tag,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(s.c.JwtPrivate)
}
