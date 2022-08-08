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
	"gorm.io/gorm"
)

type Book entity.Book
type Review entity.Review
type CreateReviewRequest entity.CreateReviewRequest
type UpdateReviewRequest entity.UpdateReviewRequest
type GetReviewsResponse entity.GetReviewsResponse
type ResponseReview entity.ResponseReview
type GetReviewStatsResponse entity.GetReviewStatsResponse

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
	if err := db.Model(&Review{}).Select("reviews.id, reviews.comment, reviews.rating, reviews.reading_status, reviews.read_pages, to_char(reviews.start_read_at, 'YYYY-MM-DD') as start_read_at, to_char(reviews.finish_read_at, 'YYYY-MM-DD') as finish_read_at, books.title as book_title, books.author as book_author, books.thumbnail_link as book_thumbnail_link, books.published_date as book_published_date, books.num_of_pages as book_num_of_pages").Joins("join books on reviews.book_id = books.id").Where("reviews.user_id = ?", user.ID).Order("reviews.updated_at desc").Limit(10).Offset(10 * (page - 1)).Scan(&results).Error; err != nil {
		// SELECT reviews.id, reviews.comment, reviews.rating, reviews.reading_status, reviews.read_pages,
		//   to_char(reviews.start_read_at, 'YYYY-MM-DD') as start_read_at,
		//   to_char(reviews.finish_read_at, 'YYYY-MM-DD') as finish_read_at,
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
	// 読書開始日、完了日が0001-01-01の場合は空文字を格納する
	for i := range results {
		results[i].StartReadAt = timeStrCoalesce(results[i].StartReadAt, "")
		results[i].FinishReadAt = timeStrCoalesce(results[i].FinishReadAt, "")
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

	// 文字列→日付オブジェクトへ変換
	var convertedStartReadAt, convertedFinishReadAt time.Time
	if request.StartReadAt != "" {
		dateLayout := "2006-01-02"
		convertedStartReadAt, err = time.Parse(dateLayout, request.StartReadAt)
		if err != nil {
			return ResponseReview{}, http.StatusBadRequest, err
		}
	} else {
		convertedStartReadAt = time.Time{}
	}

	if request.FinishReadAt != "" {
		dateLayout := "2006-01-02"
		convertedFinishReadAt, err = time.Parse(dateLayout, request.FinishReadAt)
		if err != nil {
			return ResponseReview{}, http.StatusBadRequest, err
		}
	} else {
		convertedFinishReadAt = time.Time{}
	}

	// Reviewを新規作成
	newReview := Review{
		Comment:       request.Comment,
		Rating:        request.Rating,
		ReadingStatus: request.ReadingStatus,
		ReadPages:     request.ReadPages,
		StartReadAt:   convertedStartReadAt,
		FinishReadAt:  convertedFinishReadAt,
		UserID:        user.ID,
		BookID:        book.ID,
	}

	if err := db.Create(&newReview).Error; err != nil {
		return ResponseReview{}, http.StatusBadRequest, err
	}

	// レスポンス用データ生成
	responseReview := ResponseReview{
		Comment:           newReview.Comment,
		Rating:            newReview.Rating,
		ReadingStatus:     newReview.ReadingStatus,
		ReadPages:         newReview.ReadPages,
		StartReadAt:       request.StartReadAt,
		FinishReadAt:      request.FinishReadAt,
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
	var convertedStartReadAt, convertedFinishReadAt time.Time
	if request.StartReadAt != "" {
		dateLayout := "2006-01-02"
		convertedStartReadAt, err = time.Parse(dateLayout, request.StartReadAt)
		if err != nil {
			return ResponseReview{}, http.StatusBadRequest, err
		}
	} else {
		convertedStartReadAt = time.Time{}
	}

	if request.FinishReadAt != "" {
		dateLayout := "2006-01-02"
		convertedFinishReadAt, err = time.Parse(dateLayout, request.FinishReadAt)
		if err != nil {
			return ResponseReview{}, http.StatusBadRequest, err
		}
	} else {
		convertedFinishReadAt = time.Time{}
	}

	// レビューを更新
	review.Comment = request.Comment
	review.Rating = request.Rating
	review.ReadingStatus = request.ReadingStatus
	review.ReadPages = request.ReadPages
	review.StartReadAt = convertedStartReadAt
	review.FinishReadAt = convertedFinishReadAt
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
		ReadingStatus:     review.ReadingStatus,
		ReadPages:         review.ReadPages,
		StartReadAt:       request.StartReadAt,
		FinishReadAt:      request.FinishReadAt,
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

// レビューの統計情報取得サービス
func (s Service) GetReviewStats(c *gin.Context) (GetReviewStatsResponse, StatusCode, error) {
	db := db.GetDB()
	var user User

	// JWTトークン検証
	authHeader := c.Request.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, statusCode, err := s.VerifyToken(tokenString)
	if err != nil {
		return GetReviewStatsResponse{}, statusCode, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok || !token.Valid {
		return GetReviewStatsResponse{}, http.StatusForbidden, err
	}

	// メールアドレスをキーに、ユーザを取得
	if err := db.Where("email = ?", claims["email"]).First(&user).Error; err != nil {
		return GetReviewStatsResponse{}, http.StatusNotFound, err
	}

	// パラメータ取得、指定されてない場合は今月、今年を設定
	var month, year int
	if c.Query("month") == "" {
		month = int(time.Now().Month())
	} else {
		month, err = strconv.Atoi(c.Query("month"))
		if err != nil {
			return GetReviewStatsResponse{}, http.StatusBadRequest, err
		}
	}
	if c.Query("year") == "" {
		year = int(time.Now().Year())
	} else {
		year, err = strconv.Atoi(c.Query("year"))
		if err != nil {
			return GetReviewStatsResponse{}, http.StatusBadRequest, err
		}
	}

	startDateOfMonth, endDateOfMonth := getStartAndEndDateOfMonth(year, month)

	var subQuery *gorm.DB
	formattedYear := fmt.Sprintf("%04d", year)
	// 対象月の読んだ書籍数を取得
	var numOfReadBooksOfMonth int64
	if err := db.Model(&Review{}).Select("reviews.user_id").Joins("join books on reviews.book_id = books.id").Where("reviews.user_id = ? and reviews.finish_read_at between ? and ?", user.ID, startDateOfMonth, endDateOfMonth).Count(&numOfReadBooksOfMonth).Error; err != nil {
		// SELECT reviews.user_id FROM reviews JOIN books ON reviews.book_id = books.id
		// WHERE reviews.user_id = [user.ID] AND reviews.finish_read_at BETWEEN ['YYYY-MM-01'] AND ['YYYY-MM-[28|29|30|31]']
		return GetReviewStatsResponse{}, http.StatusNotFound, err
	}

	// 対象年の読んだ書籍数を取得
	var numOfReadBooksOfYear int64
	if err := db.Model(&Review{}).Select("reviews.user_id").Joins("join books on reviews.book_id = books.id").Where("reviews.user_id = ? and reviews.finish_read_at between ? and ?", user.ID, fmt.Sprintf("%s-01-01", formattedYear), fmt.Sprintf("%s-12-31", formattedYear)).Count(&numOfReadBooksOfYear).Error; err != nil {
		// SELECT reviews.user_id FROM reviews JOIN books ON reviews.book_id = books.id
		// WHERE reviews.user_id = [user.ID] AND reviews.finish_read_at BETWEEN ['YYYY-01-01'] AND ['YYYY-12-31']
		return GetReviewStatsResponse{}, http.StatusNotFound, err
	}

	// 対象月の読んだページ数を取得
	var numOfReadPagesOfMonth int64
	subQuery = db.Model(&Review{}).Select("reviews.user_id, books.num_of_pages").Joins("join books on reviews.book_id = books.id").Where("reviews.finish_read_at between ? and ?", startDateOfMonth, endDateOfMonth)
	if err := db.Table("(?) as x", subQuery).Select("sum(x.num_of_pages) as num_of_read_pages").Group("x.user_id").Having("x.user_id = ?", user.ID).Find(&numOfReadPagesOfMonth).Error; err != nil {
		// SELECT sum(x.num_of_pages) AS num_Of_read_pages
		// FROM (
		// 	SELECT reviews.user_id, books.num_of_pages FROM reviews JOIN books ON reviews.book_id = books.id
		// 	WHERE finish_read_at BETWEEN ['YYYY-MM-01'] AND ['YYYY-MM-[28|29|30|31]']
		// ) AS x
		// GROUP BY x.user_id HAVING x.user_id = [user.ID];
		return GetReviewStatsResponse{}, http.StatusNotFound, err
	}

	// 対象年の読んだページ数を取得
	var numOfReadPagesOfYear int64
	subQuery = db.Model(&Review{}).Select("reviews.user_id, books.num_of_pages").Joins("join books on reviews.book_id = books.id").Where("reviews.finish_read_at between ? and ?", fmt.Sprintf("%s-01-01", formattedYear), fmt.Sprintf("%s-12-31", formattedYear))
	if err := db.Table("(?) as x", subQuery).Select("sum(x.num_of_pages) as num_of_read_pages").Group("x.user_id").Having("x.user_id = ?", user.ID).Find(&numOfReadPagesOfYear).Error; err != nil {
		// SELECT sum(x.num_of_pages) AS num_Of_read_pages
		// FROM (
		// 	SELECT reviews.user_id, books.num_of_pages FROM reviews JOIN books ON reviews.book_id = books.id
		// 	WHERE finish_read_at BETWEEN ['YYYY-01-01'] AND ['YYYY-12-31']
		// ) AS x
		// GROUP BY x.user_id HAVING x.user_id = [user.ID];
		return GetReviewStatsResponse{}, http.StatusNotFound, err
	}

	// レスポンス用データ生成
	getReviewStatsResponse := GetReviewStatsResponse{
		NumOfReadBooksOfMonth: numOfReadBooksOfMonth,
		NumOfReadPagesOfMonth: numOfReadPagesOfMonth,
		NumOfReadBooksOfYear:  numOfReadBooksOfYear,
		NumOfReadPagesOfYear:  numOfReadPagesOfYear,
	}

	return getReviewStatsResponse, http.StatusOK, nil
}

// 日付文字列が0001-01-01の場合はデフォルト値を、そうでない場合は元の値を返す
func timeStrCoalesce(timeStrArg, defaultTimeStr string) string {
	if timeStrArg != "0001-01-01" {
		return timeStrArg
	} else {
		return defaultTimeStr
	}
}

// 対象月の最初と最後の日付を、YYYY-MM-DDの形式でそれぞれ返却する
func getStartAndEndDateOfMonth(year, month int) (string, string) {
	// 対象月の最終日を判定
	var lastDayOfMonth string
	switch month {
	case 2:
		if year%4 == 0 && year%100 != 0 || year%400 == 0 {
			lastDayOfMonth = "29"
		} else {
			lastDayOfMonth = "28"
		}
	case 4, 6, 9, 11:
		lastDayOfMonth = "30"
	case 1, 3, 5, 7, 8, 10, 12:
		lastDayOfMonth = "31"
	}
	formattedYear := fmt.Sprintf("%04d", year)
	formattedMonth := fmt.Sprintf("%02d", month)

	startDateOfMonth := fmt.Sprintf("%s-%s-01", formattedYear, formattedMonth)
	endDateOfMonth := fmt.Sprintf("%s-%s-%s", formattedYear, formattedMonth, lastDayOfMonth)

	return startDateOfMonth, endDateOfMonth
}
