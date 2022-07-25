package db

import (
	"fmt"
	"log"
	"os"

	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db *gorm.DB
)

// データベースの接続、およびマイグレーションを行う
func Init() error {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
		return err
	}

	pgHost := os.Getenv("PG_HOST")
	pgUser := os.Getenv("PG_USER")
	pgPass := os.Getenv("PG_PASS")
	pgDBname := os.Getenv("PG_DBNAME")
	pgPort := os.Getenv("PG_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tokyo", pgHost, pgUser, pgPass, pgDBname, pgPort)
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database")
		return err
	}

	if err = autoMigrate(); err != nil {
		log.Fatal("Failed to migrate")
		return err
	}

	return nil
}

// データベースから切断
func Close() error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// パッケージグローバル変数dbのゲッター関数
func GetDB() *gorm.DB {
	return db
}

// マイグレーションを行う
func autoMigrate() error {
	if err := db.AutoMigrate(&entity.User{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&entity.Book{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&entity.Review{}); err != nil {
		return err
	}
	return nil
}
