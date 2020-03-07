package users_test

import (
	"errors"
	"fmt"
	"net/url"

	"golang.org/x/crypto/bcrypt"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "github.com/scribletop/scribletop-api/modules/scribletop"

	"github.com/scribletop/scribletop-api/modules/users"

	mocks "github.com/scribletop/scribletop-api/mocks/modules/scribletop"
	sharedmocks "github.com/scribletop/scribletop-api/mocks/shared"
)

var _ = Describe("users.UsersService", func() {
	var s UsersService
	var tg *sharedmocks.TagGenerator
	var es *sharedmocks.EmailSender
	var ur *mocks.UsersRepository
	var ev *mocks.EmailValidator

	BeforeEach(func() {
		tg = new(sharedmocks.TagGenerator)
		es = new(sharedmocks.EmailSender)
		ur = new(mocks.UsersRepository)
		ev = new(mocks.EmailValidator)
		s = users.NewUsersService(TestDB, tg, es, ur, ev)
	})

	AfterEach(func() {
		TestDB.MustExec("TRUNCATE TABLE users RESTART IDENTITY")
		es.AssertExpectations(GinkgoT())
		tg.AssertExpectations(GinkgoT())
		ur.AssertExpectations(GinkgoT())
		ev.AssertExpectations(GinkgoT())
	})

	Context("creating a user", func() {
		user := UserWithPassword{
			Password: "password",
			User: User{
				Tag:   "joe",
				Email: "joe@example.com",
			},
		}

		var generatedTag string
		var result User
		var resultErr error

		JustBeforeEach(func() {
			tg.On("Random", 4).Return(generatedTag)
			result, resultErr = s.Create(user)
		})

		Context("valid", func() {
			BeforeEach(func() {
				generatedTag = "1111"
				Expect(resultErr).NotTo(HaveOccurred())
			})

			Context("with no problem", func() {
				BeforeEach(func() {
					dst := fmt.Sprintf("%s <%s>", user.Tag+"#"+generatedTag, user.Email)
					ev.On("GenerateToken", user.Email).Return("foo")
					es.On("SendEmail", dst, "Registration complete!", "new-user", struct {
						Link string
					}{Link: "__ROOT_URL__/auth/validate-email?token=foo&email=" + url.QueryEscape(user.Email)}).Return(nil)
				})

				It("adds a tag to the username", func() {
					Expect(result.Tag).To(Equal(user.Tag + "#" + generatedTag))
				})

				It("creates an user in the database", func() {
					res, _ := TestDB.Query(
						"SELECT * FROM users WHERE email = $1 AND tag = $2", user.Email, user.Tag+"#"+generatedTag,
					)
					Expect(res.Next()).To(BeTrue())
				})

				It("hashes the password", func() {
					var password string
					_ = TestDB.Get(&password, "SELECT password FROM users")
					Expect(password).NotTo(Equal("password"))
					Expect(bcrypt.CompareHashAndPassword([]byte(password), []byte("password"))).To(BeNil())
				})

				It("sets validated to false", func() {
					var validated bool
					_ = TestDB.Get(&validated, "SELECT validated FROM users")
					Expect(validated).To(Equal(false))
				})
			})

			Context("with a registered email", func() {
				BeforeEach(func() {
					_, _ = TestDB.Exec("INSERT INTO users (email, tag, password) VALUES ($1, $2, $3)", user.Email, user.Tag, "")
					ur.On("FindByEmail", user.Email).Return(&UserWithPassword{User: User{Email: user.Email, Tag: "RealTag"}}, nil)
					dst := fmt.Sprintf("%s <%s>", "RealTag", user.Email)
					subject := "Someone tried to register with your email address"
					es.On("SendEmail", dst, subject, "new-user-duplicate-email", struct {
						Link string
						Tag  string
					}{Link: "__ROOT_URL__/auth/reset-password?email=" + user.Email, Tag: "RealTag"}).Return(nil)
				})

				It("should not add an user to the database", func() {
					var count int
					_ = TestDB.Get(&count, "SELECT COUNT(*) FROM users")
					Expect(count).To(Equal(1))
				})
			})

			Context("with a registered tag", func() {
				BeforeEach(func() {
					tg.On("RandomExcept", 4, []string{"1111"}).Return("2222", nil)
					_, _ = TestDB.Exec("INSERT INTO users (email, tag, password) VALUES ($1, $2, $3)", "joe.mama@example.com", user.Tag+"#"+generatedTag, "")
				})

				It("should succeed", func() {
					res, _ := TestDB.Query(
						"SELECT * FROM users WHERE email = $1 AND tag = $2", user.Email, user.Tag+"#2222",
					)
					Expect(res.Next()).To(BeTrue())
				})
			})
		})

		Context("with all tags registered", func() {
			BeforeEach(func() {
				tg.On("RandomExcept", 4, []string{"1111"}).Return("", errors.New("no candidate found"))
				_, _ = TestDB.Exec("INSERT INTO users (email, tag, password) VALUES ($1, $2, $3)", "joe.mama@example.com", user.Tag+"#"+generatedTag, "")
			})

			It("should tell him to be creative", func() {
				Expect(resultErr).To(HaveOccurred())
				Expect(resultErr.Error()).To(ContainSubstring("no candidate found"))
			})
		})
	})
})
