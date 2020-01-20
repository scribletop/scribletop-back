package users_test

import (
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
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
	TestDB = database.Initialize(c, zerolog.Nop())
})

var _ = AfterSuite(func() {
	TestDB.MustExec("DROP SCHEMA users_tests CASCADE")
})
