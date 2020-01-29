package config

import (
	"fmt"
	"os"
	"strconv"
)

type DatabaseConfig struct {
	Username string
	Password string
	Hostname string
	Database string
}

type HttpCorsConfig struct {
	Allow bool
	Url   string
}

type HttpConfig struct {
	Cors HttpCorsConfig
}

type Config struct {
	Database DatabaseConfig
	Http     HttpConfig
	Env      string
	Debug    bool
}

func Load() Config {
	config := Config{
		DatabaseConfig{"postgres", "password", "localhost", "scribletop"},
		HttpConfig{Cors: HttpCorsConfig{Allow: true, Url: "http://localhost:4200"}},
		"local",
		false,
	}

	if val := os.Getenv("ENV"); val != "" {
		config.Env = val
	}

	if val := os.Getenv("DEBUG"); val != "" {
		debug, err := strconv.ParseBool(val)
		config.Debug = err != nil || debug
	}

	if val := os.Getenv("DB_USERNAME"); val != "" {
		config.Database.Username = val
	}

	if val := os.Getenv("DB_PASSWORD"); val != "" {
		config.Database.Password = val
	}

	if val := os.Getenv("DB_HOSTNAME"); val != "" {
		config.Database.Password = val
	}

	if val := os.Getenv("DB_DATABASE"); val != "" {
		config.Database.Password = val
	}

	if val := os.Getenv("HTTP_CORS_ALLOW"); val != "" {
		cors, err := strconv.ParseBool(val)
		config.Http.Cors.Allow = err != nil || cors
	}

	if val := os.Getenv("HTTP_CORS_URL"); val != "" {
		config.Http.Cors.Url = val
	}

	return config
}

func LoadTest(database string) Config {
	return Config{
		DatabaseConfig{"postgres", "password", "localhost", database},
		HttpConfig{Cors: HttpCorsConfig{Allow: false, Url: ""}},
		"test",
		false,
	}
}

func Print(c Config) {
	fmt.Printf("------------------------------------------------\n")
	fmt.Printf("Running scribletop API")
	fmt.Printf("Configuration loaded:\n\n")
	fmt.Printf("ENV:        %s\n", c.Env)
	fmt.Printf("DEBUG MODE: %t\n\n", c.Debug)
	fmt.Printf("Database:\n")
	fmt.Printf("	Hostname: %s\n", c.Database.Hostname)
	fmt.Printf("	Username: %s\n", c.Database.Username)
	fmt.Printf("	Database: %s\n\n", c.Database.Database)
	fmt.Printf("Http:\n")
	if c.Http.Cors.Allow {
		fmt.Printf("	CORS: %s\n", c.Http.Cors.Url)
	} else {
		fmt.Printf("	CORS: NO\n")
	}
	fmt.Printf("------------------------------------------------\n")
}
