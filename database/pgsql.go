package database

import (
	"errors"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/markbates/pkger"
	"github.com/scribletop/scribletop-api/config"
	"io/ioutil"
	"log"
	"os"
	"time"
)

func Initialize(c config.Config) (db *sqlx.DB) {
	db, err := connect(c.Database)
	if err != nil {
		log.Fatalln("scribletop: could not connect to database: " + err.Error())
	}

	if err := migrate(db); err != nil {
		log.Fatalln("scribletop: could not execute migrations: " + err.Error())
	}

	return db
}

func connect(config config.DatabaseConfig) (*sqlx.DB, error) {
	return sqlx.Connect(
		"postgres",
		"user="+config.Username+
			" password="+config.Password+
			" host="+config.Hostname+
			" dbname="+config.Database+
			" sslmode=disable")
}

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
	WHERE table_schema = 'public'
		AND table_name = 'migrations'
);
`

type migration struct {
	Name      string
	CreatedAt time.Time `db:"created_at"`
}

func migrate(db *sqlx.DB) error {
	var exists bool
	err := db.Get(&exists, migrationsTableExistsQuery)
	if err != nil {
		return errors.New("migrate: get table: " + err.Error())
	}

	migrations := map[string]bool{}
	if !exists {
		db.MustExec(createMigrationsTable)
	} else {
		var m []migration
		err = db.Select(&m, `SELECT * FROM migrations`)
		if err != nil {
			return errors.New("migrate: get migrations: " + err.Error())
		}

		for _, c := range m {
			migrations[c.Name] = true
		}
	}

	return executeMigrations(db, migrations)
}

func executeMigrations(db *sqlx.DB, m map[string]bool) error {
	return pkger.Walk("/database/migrations", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.Name() == "migrations" {
			return nil
		}

		name := info.Name()[:11]

		if _, ok := m[name]; ok {
			log.Println("Migration " + name + " already ran.")
			return nil
		}

		log.Println("Running migration " + name + "...")

		f, err := pkger.Open(path)
		if err != nil {
			return err
		}
		defer func() {
			if err := f.Close(); err != nil {
				log.Println("scribletop: migrations: cannot close file: " + err.Error())
			}
		}()

		query, err := ioutil.ReadAll(f)
		if err != nil {
			return err
		}

		err = executeMigration(db, err, query, name)
		if err != nil {
			return err
		}

		return nil
	})
}

func executeMigration(db *sqlx.DB, err error, q []byte, n string) error {
	log.Println("Executing migration " + n + "...")
	tx := db.MustBegin()
	defer func() {
		if err != nil {
			if rb := tx.Rollback(); rb != nil {
				panic(err)
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
