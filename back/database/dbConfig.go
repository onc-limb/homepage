package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var models = []interface{}{&Category{}, &Article{}}

func SetupDB(migrateCommand bool) (*gorm.DB, error) {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")
	sslmode := "disable"
	timeZone := "Asia/Tokyo"

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s", host, user, password, dbname, port, sslmode, timeZone)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if migrateCommand {
		runMigrate(db)
	}
	return db, nil
}

func runMigrate(db *gorm.DB) {
	log.Print("run migrate")
	for _, model := range models {
		err := db.AutoMigrate(model)
		if err != nil {
			log.Fatalf("fail migration: %v", err)
		}
	}
}
