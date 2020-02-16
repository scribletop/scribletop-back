package users_test

import (
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
	"github.com/scribletop/scribletop-api/scribletop-apitest"
)

func TestUsers(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Users Suite")
}

var TestDB *sqlx.DB

var _ = BeforeSuite(func() {
	c := config.LoadTest("users_tests")
	db, err := database.Initialize(c.Database, zerolog.Nop())
	Expect(err).NotTo(HaveOccurred())
	TestDB = db
})

var _ = AfterSuite(func() {
	if TestDB != nil {
		c := config.LoadTest("users_tests")
		scribletop_apitest.CleanupDB(c.Database, TestDB)
	}
})
