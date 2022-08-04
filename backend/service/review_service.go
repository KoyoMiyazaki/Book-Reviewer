package service

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/KoyoMiyazaki/Book-Reviewer/db"
	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
)

type Book entity.Book
type Review entity.Review
type CreateReviewRequest entity.CreateReviewRequest
type UpdateReviewRequest entity.UpdateReviewRequest
type GetReviewsResponse entity.GetReviewsResponse
type ResponseReview entity.ResponseReview

// レビュー取得サービス
func (s Service) GetReviews(c *gin.Context) (GetReviewsResponse, StatusCode, error) {
	db := db.GetDB()
	var user User
	var results []entity.ResponseReview

	// JWTトークン検証
	authHeader := c.Request.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, statusCode, err := s.VerifyToken(tokenString)
	if err != nil {
		return GetReviewsResponse{}, statusCode, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok || !token.Valid {
		return GetReviewsResponse{}, http.StatusForbidden, err
	}

	// メールアドレスをキーに、ユーザを取得
	if err := db.Where("email = ?", claims["email"]).First(&user).Error; err != nil {
		return GetReviewsResponse{}, http.StatusNotFound, err
	}

	// ページパラメータ取得、指定されてない場合は1を設定
	var page int
	if c.Query("page") == "" {
		page = 1
	} else {
		page, err = strconv.Atoi(c.Query("page"))
		if err != nil {
			return GetReviewsResponse{}, http.StatusBadRequest, err
		}
	}

	// ユーザIDをキーに、レビューを取得
	if err := db.Model(&Review{}).Select("reviews.id, reviews.comment, reviews.rating, to_char(reviews.read_at, 'YYYY-MM-DD') as read_at, books.title as book_title, books.author as book_author, books.thumbnail_link as book_thumbnail_link, books.published_date as book_published_date, books.num_of_pages as book_num_of_pages").Joins("join books on reviews.book_id = books.id").Where("reviews.user_id = ?", user.ID).Order("reviews.updated_at desc").Limit(10).Offset(10 * (page - 1)).Scan(&results).Error; err != nil {
		// SELECT reviews.id, reviews.comment, reviews.rating, to_char(reviews.read_at, 'YYYY-MM-DD') as read_at,
		//   books.title as book_title, books.author as book_author,
		//   books.thumbnail_link as book_thumbnail_link,
		//   books.published_date as book_published_date,
		//   books.num_of_pages as book_num_of_pages
		// FROM `reviews` join `books` on reviews.book_id = books.id
		// WHERE reviews.user_id = user.ID
		// ORDER BY reviews.updated_at DESC
		// LIMIT 10 OFFSET [10 * (page-1)]
		return GetReviewsResponse{}, http.StatusNotFound, err
	}

	// レビューの総件数を取得
	var totalRows int64
	if err := db.Model(&Review{}).Joins("join books on reviews.book_id = books.id").Where("reviews.user_id = ?", user.ID).Count(&totalRows).Error; err != nil {
		// SELECT count(1)
		// FROM `reviews` join `books` on reviews.book_id = books.id
		// WHERE reviews.user_id = user.ID
		return GetReviewsResponse{}, http.StatusNotFound, err
	}

	// レスポンス用データ生成
	getReviewsResponse := GetReviewsResponse{
		ResponseReviews: results,
		TotalPages:      totalRows/10 + 1,
	}

	return getReviewsResponse, http.StatusOK, nil
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

	// Bookがデータベースに無い場合は新規登録
	var book Book
	if err := db.Where("title = ? AND author = ?", request.BookTitle, request.BookAuthor).First(&book).Error; err != nil {
		// Bookを新規作成
		book = Book{
			Title:         request.BookTitle,
			Author:        request.BookAuthor,
			ThumbnailLink: request.BookThumbnailLink,
			PublishedDate: request.BookPublishedDate,
			NumOfPages:    request.BookNumOfPages,
		}

		if err := db.Create(&book).Error; err != nil {
			return ResponseReview{}, http.StatusBadRequest, err
		}
	}
	fmt.Println(request.ReadAt)

	// 文字列→日付オブジェクトへ変換
	dateLayout := "2006-01-02"
	convertedReadAt, err := time.Parse(dateLayout, request.ReadAt)
	if err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// Reviewを新規作成
	newReview := Review{
		Comment: request.Comment,
		Rating:  request.Rating,
		ReadAt:  convertedReadAt,
		UserID:  user.ID,
		BookID:  book.ID,
	}

	if err := db.Create(&newReview).Error; err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// レスポンス用データ生成
	responseReview := ResponseReview{
		Comment:           newReview.Comment,
		Rating:            newReview.Rating,
		ReadAt:            request.ReadAt,
		BookTitle:         book.Title,
		BookAuthor:        book.Author,
		BookThumbnailLink: book.ThumbnailLink,
		BookPublishedDate: book.PublishedDate,
		BookNumOfPages:    book.NumOfPages,
	}

	return responseReview, http.StatusCreated, nil
}

// レビュー更新用サービス
func (s Service) UpdateReview(c *gin.Context) (ResponseReview, StatusCode, error) {
	db := db.GetDB()
	var request UpdateReviewRequest
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

	// IDをキーに、レビューを取得
	id := c.Param("id")
	var review Review
	if err := db.Where("id = ?", id).First(&review).Error; err != nil {
		return ResponseReview{}, http.StatusNotFound, err
	}

	// メールアドレスをキーに、ユーザを取得
	var user User
	if err := db.Where("email = ?", claims["email"]).First(&user).Error; err != nil {
		return ResponseReview{}, http.StatusNotFound, err
	}

	// 更新対象レビューのユーザIDと、ログインユーザIDが一致していなければ更新しない
	if review.UserID != user.ID {
		return ResponseReview{}, http.StatusForbidden, fmt.Errorf("couldn't update this review")
	}

	// 文字列→日付オブジェクトへ変換
	dateLayout := "2006-01-02"
	convertedReadAt, err := time.Parse(dateLayout, request.ReadAt)
	if err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// レビューを更新
	review.Comment = request.Comment
	review.Rating = request.Rating
	review.ReadAt = convertedReadAt
	if err := db.Save(&review).Error; err != nil {
		return ResponseReview{}, http.StatusInternalServerError, err
	}

	// IDをキーに、書籍を取得
	var book Book
	if err := db.Where("id = ?", review.BookID).First(&book).Error; err != nil {
		return ResponseReview{}, http.StatusNotFound, err
	}

	// レスポンス用データ生成
	responseReview := ResponseReview{
		Comment:           review.Comment,
		Rating:            review.Rating,
		ReadAt:            request.ReadAt,
		BookTitle:         book.Title,
		BookAuthor:        book.Author,
		BookThumbnailLink: book.ThumbnailLink,
		BookPublishedDate: book.PublishedDate,
		BookNumOfPages:    book.NumOfPages,
	}

	return responseReview, http.StatusOK, nil
}

// レビュー削除用サービス
func (s Service) DeleteReview(c *gin.Context) (StatusCode, error) {
	db := db.GetDB()

	// JWTトークン検証
	authHeader := c.Request.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, statusCode, err := s.VerifyToken(tokenString)
	if err != nil {
		return statusCode, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok || !token.Valid {
		return http.StatusForbidden, err
	}

	// IDをキーに、レビューを取得
	id := c.Param("id")
	var review Review
	if err := db.Where("id = ?", id).First(&review).Error; err != nil {
		return http.StatusNotFound, err
	}

	// メールアドレスをキーに、ユーザを取得
	var user User
	if err := db.Where("email = ?", claims["email"]).First(&user).Error; err != nil {
		return http.StatusNotFound, err
	}

	// 削除対象レビューのユーザIDと、ログインユーザIDが一致していなければ削除しない
	if review.UserID != user.ID {
		return http.StatusForbidden, fmt.Errorf("couldn't delete this review")
	}

	if err := db.Delete(&review).Error; err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
