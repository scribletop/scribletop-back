package main

import (
	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/database"
	"github.com/scribletop/scribletop-api/http/router"
	"os"
)

func main() {
	c := config.Load()
	config.Print(c)

	l := createLogger(c)

	db := database.Initialize(c, l.With().Str("component", "database").Logger())
	defer func() {
		if err := db.Close(); err != nil {
			l.Err(err).Str("component", "database").Msg("Could not close database.")
		}
	}()

	httpLogger := l.With().Str("component", "http").Logger()

	r := gin.New()
	r.Use(logger.SetLogger(logger.Config{Logger: &httpLogger}), gin.RecoveryWithWriter(l))

	router.RegisterControllers(r, db)

	if err := r.Run(); err != nil {
		log.Fatal().Err(err).Msg("Could not run server.")
	}
}

func createLogger(c config.Config) zerolog.Logger {
	l := zerolog.New(os.Stderr)
	if c.Env == "local" {
		l = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	} else {
		zerolog.SetGlobalLevel(zerolog.WarnLevel)
	}

	if c.Debug {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
	return l
}
