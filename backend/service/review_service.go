package service

import (
	"net/http"

	"github.com/KoyoMiyazaki/Book-Reviewer/db"
	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Book entity.Book
type Review entity.Review
type CreateReviewRequest entity.CreateReviewRequest

// レビュー登録用サービス
func (s Service) CreateReview(c *gin.Context) (Review, StatusCode, error) {
	db := db.GetDB()
	var user User
	var request CreateReviewRequest
	var validate *validator.Validate = validator.New()

	// JSONリクエストデータを取得
	if err := c.BindJSON(&request); err != nil {
		return Review{}, http.StatusBadRequest, err
	}

	// リクエストデータのバリデーションチェック
	if err := validate.Struct(request); err != nil {
		return Review{}, http.StatusBadRequest, err
	}

	// メールアドレスをキーに、ユーザを取得
	if err := db.Where("email = ?", request.UserEmail).First(&user).Error; err != nil {
		return Review{}, http.StatusNotFound, err
	}

	// Bookを新規作成
	newBook := Book{
		Title:         request.BookTitle,
		Author:        request.BookAuthor,
		ThumbnailLink: request.BookThumbnailLink,
		PublishedDate: request.BookPublishedDate,
	}

	if err := db.Create(&newBook).Error; err != nil {
		return Review{}, http.StatusBadRequest, err
	}

	// Reviewを新規作成
	newReview := Review{
		Comment: request.Comment,
		Rating:  request.Rating,
		UserID:  user.ID,
		BookID:  newBook.ID,
	}

	if err := db.Create(&newReview).Error; err != nil {
		return Review{}, http.StatusBadRequest, err
	}

	return newReview, http.StatusCreated, nil
}
