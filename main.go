package main

import (
	"github.com/gin-gonic/gin"
	"github.com/scribletop/scribletop-api/http/router"
	"os"
)

func main() {
	r := gin.Default()
	router.RegisterControllers(r)

	if err := r.Run(); err != nil {
		os.Exit(1)
	}
}
