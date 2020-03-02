package users_test

import (
	"database/sql"
	"github.com/scribletop/scribletop-api/modules/interfaces"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/scribletop/scribletop-api/modules/users"
)

var _ = Describe("users.UsersRepository", func() {
	var r interfaces.UsersRepository
	BeforeEach(func() {
		r = users.NewUsersRepository(TestDB)
	})

	AfterEach(func() {
		TestDB.MustExec("TRUNCATE TABLE users")
	})

	Context("FindByEmail", func() {
		Context("when the user exists", func() {
			It("returns the user", func() {
				TestDB.MustExec("INSERT INTO users(email, tag, password) VALUES ('a', 'b', 'c')")
				res, err := r.FindByEmail("a")
				Expect(err).NotTo(HaveOccurred())
				Expect(res.Tag).To(Equal("b"))
			})
		})

		Context("when the user does not exists", func() {
			It("fails with ErrNoRows", func() {
				res, err := r.FindByEmail("")
				Expect(res).To(BeNil())
				Expect(err).To(HaveOccurred())
				Expect(err).To(Equal(sql.ErrNoRows))
			})
		})
	})
})
