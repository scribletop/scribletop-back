package users_test

import (
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
	scribletop_apitest "github.com/scribletop/scribletop-api/scribletop-apitest"
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestUsers(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Users Suite")
}

var TestDB *sqlx.DB

var _ = BeforeSuite(func() {
	c := config.LoadTest("users_tests")
	TestDB = database.Initialize(c.Database, zerolog.Nop())
})

var _ = AfterSuite(func() {
	c := config.LoadTest("users_tests")
	scribletop_apitest.CleanupDB(c.Database, TestDB)
})
