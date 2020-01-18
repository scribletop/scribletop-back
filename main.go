package main

import (
	"github.com/gin-gonic/gin"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
	"github.com/scribletop/scribletop-api/http/router"
	"log"
)

func main() {
	c := config.Load()
	db, err := database.Connect(c.Database)
	if err != nil {
		log.Fatalln("scribletop: could not connect to database: " + err.Error())
	}
	defer db.Close()

	r := gin.Default()
	router.RegisterControllers(r)

	if err := r.Run(); err != nil {
		log.Fatalln("scribletop: could not run server: " + err.Error())
	}
}
