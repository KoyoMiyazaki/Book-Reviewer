package service

import (
	"net/http"
	"strings"

	"github.com/KoyoMiyazaki/Book-Reviewer/db"
	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
)

type Book entity.Book
type Review entity.Review
type CreateReviewRequest entity.CreateReviewRequest
type ResponseReview entity.ResponseReview

// レビュー取得サービス
func (s Service) GetReviews(c *gin.Context) ([]ResponseReview, StatusCode, error) {
	db := db.GetDB()
	var user User
	var results []ResponseReview

	// JWTトークン検証
	authHeader := c.Request.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, statusCode, err := s.VerifyToken(tokenString)
	if err != nil {
		return []ResponseReview{}, statusCode, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok || !token.Valid {
		return []ResponseReview{}, http.StatusForbidden, err
	}

	// メールアドレスをキーに、ユーザを取得
	if err := db.Where("email = ?", claims["email"]).First(&user).Error; err != nil {
		return []ResponseReview{}, http.StatusNotFound, err
	}

	// ユーザIDをキーに、レビューを取得
	if err := db.Model(&Review{}).Select("reviews.comment, reviews.rating, books.title as book_title, books.author as book_author, books.thumbnail_link as book_thumbnail_link, books.published_date as book_published_date").Joins("join books on reviews.book_id = books.id").Where("reviews.user_id = ?", user.ID).Scan(&results).Error; err != nil {
		// SELECT reviews.comment, reviews.rating, books.title as book_title,
		//   books.author as book_author, books.thumbnail_link as book_thumbnail_link,
		//   books.published_date as book_published_date
		// FROM `reviews` join `books` on reviews.book_id = books.id
		// WHERE reviews.user_id = user.ID
		return []ResponseReview{}, http.StatusNotFound, err
	}

	return results, http.StatusOK, nil
}

// レビュー登録用サービス
func (s Service) CreateReview(c *gin.Context) (ResponseReview, StatusCode, error) {
	db := db.GetDB()
	var user User
	var request CreateReviewRequest
	var validate *validator.Validate = validator.New()

	// JWTトークン検証
	authHeader := c.Request.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, statusCode, err := s.VerifyToken(tokenString)
	if err != nil {
		return ResponseReview{}, statusCode, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok || !token.Valid {
		return ResponseReview{}, http.StatusForbidden, err
	}

	// JSONリクエストデータを取得
	if err := c.BindJSON(&request); err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// リクエストデータのバリデーションチェック
	if err := validate.Struct(request); err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// メールアドレスをキーに、ユーザを取得
	if err := db.Where("email = ?", claims["email"]).First(&user).Error; err != nil {
		return ResponseReview{}, http.StatusNotFound, err
	}

	// Bookを新規作成
	newBook := Book{
		Title:         request.BookTitle,
		Author:        request.BookAuthor,
		ThumbnailLink: request.BookThumbnailLink,
		PublishedDate: request.BookPublishedDate,
	}

	if err := db.Create(&newBook).Error; err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// Reviewを新規作成
	newReview := Review{
		Comment: request.Comment,
		Rating:  request.Rating,
		UserID:  user.ID,
		BookID:  newBook.ID,
	}

	if err := db.Create(&newReview).Error; err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// レスポンス用データ生成
	responseReview := ResponseReview{
		Comment:           newReview.Comment,
		Rating:            newReview.Rating,
		BookTitle:         newBook.Title,
		BookAuthor:        newBook.Author,
		BookThumbnailLink: newBook.ThumbnailLink,
		BookPublishedDate: newBook.PublishedDate,
	}

	return responseReview, http.StatusCreated, nil
}
