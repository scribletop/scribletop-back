package auth

import (
	"crypto/rsa"
	"encoding/base64"
	"github.com/dgrijalva/jwt-go/v4"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/modules/users"
	"time"
)

type Service interface {
	Authenticate() (string, error)
}

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
	us users.Service
}

func NewAuthService(us users.Service, c config.HttpConfig) Service {
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
	}, us}
}

func (s *service) Authenticate() (string, error) {
	claims := &jwt.StandardClaims{
		Audience:  []string{"scblta"},
		ExpiresAt: &jwt.Time{
			Time: time.Now().Add(time.Hour),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(s.c.JwtPrivate)
}
