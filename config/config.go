package config

import "os"

type DatabaseConfig struct {
	Username string
	Password string
	Hostname string
	Database string
}

type Config struct {
	Database DatabaseConfig
	Env      string
}

func Load() Config {
	config := Config{
		DatabaseConfig{"postgres", "password", "localhost", "scribletop"},
		"local",
	}

	if val := os.Getenv("ENV"); val != "" {
		config.Env = val
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
