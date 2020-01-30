package auth_test

import (
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
	"github.com/scribletop/scribletop-api/scribletop-apitest"
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestAuth(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Auth Suite")
}

var TestDB *sqlx.DB
var TestConfig config.Config

var _ = BeforeSuite(func() {
	TestConfig = config.LoadTest("auth_tests")
	db, err := database.Initialize(TestConfig.Database, zerolog.Nop())
	Expect(err).NotTo(HaveOccurred())
	TestDB = db
})

var _ = AfterSuite(func() {
	if TestDB != nil {
		c := config.LoadTest("auth_tests")
		scribletop_apitest.CleanupDB(c.Database, TestDB)
	}
})
