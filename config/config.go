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
}

func Load() Config {
	config := Config{DatabaseConfig{"root", "password", "localhost", "scribletop"}}

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
