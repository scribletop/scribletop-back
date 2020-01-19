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

type Config struct {
	Database DatabaseConfig
	Env      string
	Debug    bool
}

func Load() Config {
	config := Config{
		DatabaseConfig{"postgres", "password", "localhost", "scribletop"},
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

	return config
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
	fmt.Printf("	Database: %s\n", c.Database.Database)
	fmt.Printf("------------------------------------------------\n")
}
