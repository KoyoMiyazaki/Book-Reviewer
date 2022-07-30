package service

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/KoyoMiyazaki/Book-Reviewer/db"
	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type ResponseBook entity.ResponseBook
type ResponseFromGoogleBooks entity.ResponseFromGoogleBooks
type SearchResponse entity.SearchResponse

// 書籍検索サービス
func (s Service) SearchBooks(c *gin.Context) ([]entity.ResponseBook, StatusCode, error) {
	db := db.GetDB()
	search := c.Query("search")
	// searchパラメータが指定されていな場合はエラー
	if search == "" {
		return []entity.ResponseBook{}, http.StatusBadRequest, fmt.Errorf("search word must be 1 or more characters")
	}

	// Authorizationヘッダが指定されていない場合は全書籍のisReviewedをfalseとして返却するため、それの判定を行う
	var isAuthenticated bool
	var user User
	authHeader := c.Request.Header.Get("Authorization")
	if authHeader == "" {
		isAuthenticated = false
	} else {
		// JWTトークン検証
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, statusCode, err := s.VerifyToken(tokenString)
		if err != nil {
			return []entity.ResponseBook{}, statusCode, err
		}

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok || !token.Valid {
			return []entity.ResponseBook{}, http.StatusForbidden, err
		}

		// メールアドレスをキーに、ユーザを取得
		if err := db.Where("email = ?", claims["email"]).First(&user).Error; err != nil {
			return []entity.ResponseBook{}, http.StatusNotFound, err
		}

		isAuthenticated = true
	}

	// searchパラメータを指定し、Google Books APIからデータ取得
	booksFromGoogleBooks, err := getBooksFromGoogleBooks(search)
	if err != nil {
		return []entity.ResponseBook{}, http.StatusInternalServerError, err
	}

	// Google Books APIから受け取った書籍データを、書籍検索レスポンス用の書籍構造体へと変換
	var response SearchResponse
	var responseBooks []entity.ResponseBook
	for _, bookFromGoogleBooks := range booksFromGoogleBooks.Items {
		responseBook := entity.ResponseBook{}
		responseBook.ID = bookFromGoogleBooks.ID
		responseBook.Title = bookFromGoogleBooks.VolumeInfo.Title
		// 著者が複数いる場合はカンマで区切る
		responseBook.Author = strings.Join(bookFromGoogleBooks.VolumeInfo.Authors, ", ")
		responseBook.ThumbnailLink = bookFromGoogleBooks.VolumeInfo.ImageLinks.Thumbnail
		responseBook.PublishedDate = bookFromGoogleBooks.VolumeInfo.PublishedDate
		responseBook.NumOfPages = bookFromGoogleBooks.VolumeInfo.PageCount
		if isAuthenticated {
			// ログインユーザが対象の書籍をレビュー済みか判定
			responseBook.IsReviewed = isReviewed(user.ID, responseBook.Title, responseBook.Author)
		} else {
			responseBook.IsReviewed = false
		}

		responseBooks = append(responseBooks, responseBook)
	}

	response.ResponseBooks = responseBooks

	return responseBooks, http.StatusOK, nil
}

// Google Books APIからデータ取得
func getBooksFromGoogleBooks(searchWord string) (ResponseFromGoogleBooks, error) {
	// Google Books API宛てにGET
	apiUrl := fmt.Sprintf("https://www.googleapis.com/books/v1/volumes?q=%s", searchWord)
	req, err := http.NewRequest("GET", apiUrl, nil)
	if err != nil {
		return ResponseFromGoogleBooks{}, err
	}
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return ResponseFromGoogleBooks{}, err
	}
	defer res.Body.Close()

	// レスポンスのボディ部分を読み込み
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return ResponseFromGoogleBooks{}, err
	}

	// レスポンスデータ(JSON)を、Google Books APIのレスポンス用構造体に変換
	booksFromGoogleBooks := ResponseFromGoogleBooks{}
	if err := json.Unmarshal(body, &booksFromGoogleBooks); err != nil {
		return ResponseFromGoogleBooks{}, err
	}

	return booksFromGoogleBooks, nil
}

// 対象のユーザが対象の書籍に対してレビューを行っているか判定する
func isReviewed(userID uint, bookTitle string, bookAuthor string) bool {
	db := db.GetDB()

	// タイトルと著者をキーに、書籍データを取得
	var book Book
	if err := db.Where("title = ? AND author = ?", bookTitle, bookAuthor).First(&book).Error; err != nil {
		return false
	}

	// ユーザIDと書籍IDをキーに、レビューデータを取得
	var review Review
	if err := db.Where("user_id = ? AND book_id = ?", userID, book.ID).First(&review).Error; err != nil {
		return false
	}
	return true
}
