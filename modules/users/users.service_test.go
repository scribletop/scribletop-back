package users_test

import (
	"errors"
	"github.com/scribletop/scribletop-api/modules/users"
	"github.com/scribletop/scribletop-api/shared/mocks"
	"golang.org/x/crypto/bcrypt"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Users.Service", func() {
	var s users.Service
	var tg *mocks.TagGenerator

	BeforeEach(func() {
		tg = new(mocks.TagGenerator)
		s = users.NewUsersService(TestDB, tg)
	})

	AfterEach(func() {
		tg.AssertExpectations(GinkgoT())
		TestDB.MustExec("TRUNCATE TABLE users")
	})

	Context("Creating a user", func() {
		user := users.UserWithPassword{
			Password: "password",
			User: users.User{
				Tag:   "joe",
				Email: "joe@example.com",
			},
		}
		var generatedTag string

		var result users.User
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

			Context("with a registered email", func() {
				BeforeEach(func() {
					_, _ = TestDB.Exec("INSERT INTO users (email, tag, password) VALUES ($1, $2, $3)", user.Email, user.Tag+"#"+generatedTag, "")
				})

				It("should not add an user to the database", func() {
					var count int
					_ = TestDB.Get(&count, "SELECT COUNT(*) FROM users")
					Expect(count).To(Equal(1))
				})
			})
		})


		Context("With all tags registered", func() {
			BeforeEach(func() {
				tg.On("RandomExcept", 4, []string{"1111"}).Return("", errors.New("no candidate found"))
				_, _ = TestDB.Exec("INSERT INTO users (email, tag, password) VALUES ($1, $2, $3)", "joe.mama@example.com", "joe#1111", "")
			})

			It("should tell him to be creative", func() {
				Expect(resultErr).To(HaveOccurred())
				Expect(resultErr.Error()).To(ContainSubstring("no candidate found"))
			})
		})
	})
})
