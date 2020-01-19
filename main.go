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
	db := database.Initialize(c)
	defer func() {
		if err := db.Close(); err != nil {
			log.Println("scribletop: db.Close: " + err.Error())
		}
	}()

	r := gin.Default()
	router.RegisterControllers(r)

	if err := r.Run(); err != nil {
		log.Fatalln("scribletop: r.run: " + err.Error())
	}
}
