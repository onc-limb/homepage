package database

import (
	"flag"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var models = []interface{}{&Article{}, &Category{}}
var migrateCommand = flag.Bool("migrate", false, "Run database migrations")

func SetupDB() (*gorm.DB, error) {
	dsn := "host=homepage-db user=homepage_user password=homepage_pass dbname=homepage_db port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if *migrateCommand {
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
