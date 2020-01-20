package scribletop_apitest

import (
	"github.com/gin-gonic/gin"
	"net/http/httptest"
)

func SetupTestRouter() (w *httptest.ResponseRecorder, r *gin.Engine) {
	w = httptest.NewRecorder()
	gin.SetMode(gin.TestMode)
	r = gin.Default()
	return
}
