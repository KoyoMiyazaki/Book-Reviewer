package auth

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/KoyoMiyazaki/Book-Reviewer/db"
	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type Service struct{}

type User entity.User
type StatusCode int
type RegisterRequest entity.RegisterRequest
type LoginRequest entity.LoginRequest

// ユーザ登録サービス
func (s Service) Register(c *gin.Context) (User, StatusCode, error) {
	db := db.GetDB()
	var request RegisterRequest
	var validate *validator.Validate = validator.New()

	// JSONリクエストデータを取得
	if err := c.BindJSON(&request); err != nil {
		return User{}, http.StatusBadRequest, err
	}

	// リクエストデータのバリデーションチェック
	if err := validate.Struct(request); err != nil {
		return User{}, http.StatusBadRequest, err
	}

	// パスワードの一致確認
	if err := verifyPassword(request.Password, request.PasswordConfirmation); err != nil {
		return User{}, http.StatusBadRequest, err
	}

	// パスワードをハッシュ化
	password := []byte(request.Password)
	hashedPassword, err := bcrypt.GenerateFromPassword(password, 10)
	if err != nil {
		return User{}, http.StatusInternalServerError, err
	}

	newUser := User{
		Name:     request.Name,
		Email:    request.Email,
		Password: string(hashedPassword),
	}

	if err := db.Create(&newUser).Error; err != nil {
		return User{}, http.StatusBadRequest, err
	}

	return newUser, http.StatusCreated, nil
}

// ログインサービス
func (s Service) Login(c *gin.Context) (User, StatusCode, error) {
	db := db.GetDB()
	var user User
	var request LoginRequest
	var validate *validator.Validate = validator.New()

	// JSONリクエストデータを取得
	if err := c.BindJSON(&request); err != nil {
		return User{}, http.StatusBadRequest, err
	}

	// リクエストデータのバリデーションチェック
	if err := validate.Struct(request); err != nil {
		return User{}, http.StatusBadRequest, err
	}

	if err := db.Where("email = ?", request.Email).First(&user).Error; err != nil {
		return User{}, http.StatusNotFound, err
	}

	// 入力したパスワードと、DB上のパスワードを検証
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		return User{}, http.StatusBadRequest, err
	}

	return user, http.StatusOK, nil
}

// JWTトークン生成サービス
func (s Service) GenerateJwtToken(user User) (string, StatusCode, error) {
	err := godotenv.Load()
	if err != nil {
		return "", http.StatusInternalServerError, err
	}
	secretKey := os.Getenv("SECRET_KEY")

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.ID,
		"name":   user.Name,
		"email":  user.Email,
		"exp":    time.Now().Add(time.Hour * 1).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", http.StatusInternalServerError, err
	}

	return tokenString, http.StatusOK, nil
}

// JWTトークン検証サービス
func (s Service) VerifyToken(tokenString string) (*jwt.Token, StatusCode, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	secretKey := os.Getenv("SECRET_KEY")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return token, http.StatusUnauthorized, err
	}

	return token, http.StatusOK, nil
}

// パスワード検証関数
func verifyPassword(p1, p2 string) error {
	if p1 != p2 {
		return errors.New("Error: Passwords do not match")
	}
	return nil
}
