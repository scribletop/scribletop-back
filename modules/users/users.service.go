package users

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"

	. "github.com/scribletop/scribletop-api/modules/scribletop"

	"github.com/scribletop/scribletop-api/shared"
)

type service struct {
	db *sqlx.DB
	tg shared.TagGenerator
	es shared.EmailSender
	ur UsersRepository
	ev EmailValidator
}

func NewUsersService(db *sqlx.DB, tg shared.TagGenerator, es shared.EmailSender, ur UsersRepository, ev EmailValidator) UsersService {
	return &service{db, tg, es, ur, ev}
}

func (s *service) Create(user UserWithPassword) (User, error) {
	user.Tag = fmt.Sprintf("%s#%s", user.Tag, s.tg.Random(4))
	hashed, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return User{}, err
	}
	user.Password = string(hashed)

	_, err = s.db.NamedExec("INSERT INTO users (email, tag, password) VALUES (:email, :tag, :password)", &user)
	if err != nil {
		return s.handleCreateError(err, user)
	}

	dst := fmt.Sprintf("%s <%s>", user.Tag, user.Email)
	_ = s.es.SendEmail(dst, "Registration complete!", "new-user", struct {
		Link string
	}{Link: "__ROOT_URL__/auth/validate-email?token=" + s.ev.GenerateToken(user.Email) + "&email=" + url.QueryEscape(user.Email)})

	return User{
		Tag:   user.Tag,
		Email: user.Email,
	}, nil
}

func (s *service) handleCreateError(err error, user UserWithPassword) (User, error) {
	if strings.Contains(err.Error(), "duplicate") {
		if strings.Contains(err.Error(), "email") {
			u, err := s.ur.FindByEmail(user.Email)
			if err != nil {
				return User{}, err
			}

			dst := fmt.Sprintf("%s <%s>", u.Tag, u.Email)
			_ = s.es.SendEmail(dst, "Someone tried to register with your email address", "new-user-duplicate-email", struct {
				Link string
				Tag  string
			}{Link: "__ROOT_URL__/auth/reset-password?email=" + u.Email, Tag: u.Tag})

			return User{
				Tag:   user.Tag,
				Email: user.Email,
			}, nil
		}

		if strings.Contains(err.Error(), "tag") {
			tag, err := s.insertWithNewTag(user)
			if err != nil {
				return User{}, err
			}

			return User{
				Tag:   tag,
				Email: user.Email,
			}, nil
		}
	}

	return User{}, err
}

func (s *service) insertWithNewTag(user UserWithPassword) (string, error) {
	user.Tag = strings.Split(user.Tag, "#")[0] + "%"
	var unavailableTags []string
	err := s.db.Select(&unavailableTags, "SELECT RIGHT(tag, 4) FROM users WHERE tag LIKE $1", user.Tag)
	if err != nil {
		return "", err
	}

	tag, err := s.tg.RandomExcept(4, unavailableTags)
	if err != nil {
		return "", err
	}
	user.Tag = strings.Split(user.Tag, "%")[0] + "#" + tag

	_, err = s.db.NamedExec("INSERT INTO users (email, tag, password) VALUES (:email, :tag, :password)", &user)
	if err != nil {
		return "", err
	}

	return user.Tag, nil
}
