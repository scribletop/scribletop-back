package database

import (
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/markbates/pkger"
	"github.com/rs/zerolog"
	"github.com/scribletop/scribletop-api/config"
	"io/ioutil"
	"os"
	"strings"
	"time"
)

var createMigrationsTable = `
CREATE TABLE migrations (
  name char(11) primary key,
  created_at timestamp
)
`

var migrationsTableExistsQuery = `
SELECT EXISTS (
	SELECT 1
	FROM information_schema.tables
	WHERE table_catalog = $1
	    AND table_schema = 'public'
		AND table_name = 'migrations'
);
`

func Initialize(c config.DatabaseConfig, log zerolog.Logger) (db *sqlx.DB) {
	log.Debug().Msg("Connecting to database...")

	defaultConfig := config.DatabaseConfig{
		Username: c.Username,
		Password: c.Password,
		Hostname: c.Hostname,
	}
	db, err := Connect(defaultConfig)
	if err != nil {
		log.Fatal().Err(err).Msg("Cannot connect to database.")
	}

	safeDB := strings.Split(c.Database, ";")[0]
	_, err = db.Exec(fmt.Sprintf("CREATE DATABASE %s", safeDB))
	if err != nil && err.Error() != fmt.Sprintf("pq: database \"%s\" already exists", safeDB) {
		log.Fatal().Err(err).Msg("Cannot create database.")
	}

	if err = db.Close(); err != nil {
		log.Fatal().Err(err).Msg("Cannot connect to database.")
	}

	db, err = Connect(c)
	if err != nil {
		log.Fatal().Err(err).Msg("Cannot connect to database.")
	}

	log.Info().Msg("Connected to database.")

	if err := migrate(db, log, c.Database); err != nil {
		log.Fatal().Err(err).Msg("Could not execute migrations.")
	}

	log.Info().Msg("Database initialized and migrated.")

	return db
}

func Connect(config config.DatabaseConfig) (*sqlx.DB, error) {
	dsn := fmt.Sprintf(
		"user=%s password=%s host=%s sslmode=disable",
		config.Username, config.Password, config.Hostname,
	)

	if config.Database != "" {
		dsn += fmt.Sprintf(" dbname=%s", config.Database)
	}

	return sqlx.Connect("postgres", dsn)
}

func migrate(db *sqlx.DB, log zerolog.Logger, database string) error {
	log.Debug().Msg("Looking for migrations table...")

	var exists bool
	err := db.Get(&exists, migrationsTableExistsQuery, database)
	if err != nil {
		return err
	}

	migrations := map[string]bool{}
	if !exists {
		log.Debug().Msg("Migrations table does not exists.")
		log.Warn().Msg("Creating migrations table...")
		db.MustExec(createMigrationsTable)
		log.Info().Msg("Created migrations table.")
	} else {
		log.Debug().Msg("Retrieving old migrations...")
		r, err := db.Query(`SELECT name FROM migrations`)
		if err != nil {
			return err
		}

		for r.Next() {
			var n string
			if err := r.Scan(&n); err != nil {
				return err
			}

			migrations[n] = true
		}
	}

	return executeMigrations(db, log, migrations)
}

func executeMigrations(db *sqlx.DB, log zerolog.Logger, m map[string]bool) error {
	log.Info().Msg("Finding new migrations to run...")
	return pkger.Walk("/database/migrations", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.Name() == "migrations" {
			return nil
		}

		name := info.Name()[:11]
		ml := log.With().Str("migration_name", name).Logger()
		if _, ok := m[name]; ok {
			ml.Debug().Msg("Migration already ran.")
			return nil
		}

		ml.Debug().Msg("Opening migration file...")
		query, err := readMigrationFile(path)
		if err != nil {
			return err
		}

		err = executeMigration(db, ml, query, name)
		if err != nil {
			ml.Err(err).Msg("Could not run migration.")
			return err
		}

		return nil
	})
}

func readMigrationFile(path string) (query []byte, err error) {
	f, err := pkger.Open(path)
	if err != nil {
		return
	}
	defer func() {
		err = f.Close()
	}()

	return ioutil.ReadAll(f)
}

func executeMigration(db *sqlx.DB, log zerolog.Logger, q []byte, n string) (err error) {
	log.Warn().Msg("Running migration...")

	tx := db.MustBegin()
	defer func() {
		if err != nil {
			if rb := tx.Rollback(); rb != nil {
				panic(rb)
			}
		}
	}()

	_, err = tx.Exec(string(q))
	if err != nil {
		return err
	}

	_, err = tx.Exec(`INSERT INTO migrations (name, created_at) VALUES ($1, $2)`, n, time.Now())
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
