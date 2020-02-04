package scribletop_apitest

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
	"net/http/httptest"
	"strings"
)

func SetupTestRouter() (w *httptest.ResponseRecorder, r *gin.Engine) {
	w = httptest.NewRecorder()
	gin.SetMode(gin.TestMode)
	r = gin.New()
	return
}

func CleanupDB(c config.DatabaseConfig, db *sqlx.DB) {
	_ = db.Close()
	defaultConfig := config.DatabaseConfig{
		Username: c.Username,
		Password: c.Password,
		Hostname: c.Hostname,
	}
	db, err := database.Connect(defaultConfig)
	if err != nil {
		panic(err)
	}

	safeDB := strings.Split(c.Database, ";")[0]
	db.MustExec(fmt.Sprintf(`
SELECT pid, pg_terminate_backend(pid) 
FROM pg_stat_activity
WHERE datname = '%s'`, safeDB))
	db.MustExec(fmt.Sprintf(`DROP DATABASE %s`, safeDB))
	db.Close()
}
