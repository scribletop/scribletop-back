package main

import (
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
	"github.com/scribletop/scribletop-api/http/router"
	"os"
)

func main() {
	l := zerolog.New(os.Stderr)
	c := config.Load()
	db := database.Initialize(c, l.With().Str("component", "database").Logger())
	defer func() {
		if err := db.Close(); err != nil {
			l.Err(err).Str("component", "database").Msg("Could not close database.")
		}
	}()

	r := gin.New()
	router.RegisterControllers(r)

	if err := r.Run(); err != nil {
		log.Fatal().Err(err).Msg("Could not run server.")
	}
}
