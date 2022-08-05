package controller

import (
	"net/http"

	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	service "github.com/KoyoMiyazaki/Book-Reviewer/service"
	"github.com/gin-gonic/gin"
)

type ResponseReview entity.ResponseReview

// レビュー取得コントローラ
func (ctrl Controller) GetReviews(c *gin.Context) {
	var s service.Service
	reviews, statusCode, err := s.GetReviews(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   []ResponseReview{},
		}
		c.JSON(int(statusCode), response)
	} else {
		response := Response{
			Status: "success",
			Error:  "",
			Data:   reviews,
		}
		c.JSON(http.StatusOK, response)
	}
}

// レビュー登録コントローラ
func (ctrl Controller) CreateReview(c *gin.Context) {
	var s service.Service
	newReview, statusCode, err := s.CreateReview(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseReview{},
		}
		c.JSON(int(statusCode), response)
	} else {
		response := Response{
			Status: "success",
			Error:  "",
			Data:   newReview,
		}
		c.JSON(http.StatusCreated, response)
	}
}

// レビュー更新コントローラ
func (ctrl Controller) UpdateReview(c *gin.Context) {
	var s service.Service
	updatedReview, statusCode, err := s.UpdateReview(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseReview{},
		}
		c.JSON(int(statusCode), response)
	} else {
		response := Response{
			Status: "success",
			Error:  "",
			Data:   updatedReview,
		}
		c.JSON(http.StatusOK, response)
	}
}

// レビュー削除コントローラ
func (ctrl Controller) DeleteReview(c *gin.Context) {
	var s service.Service
	statusCode, err := s.DeleteReview(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseReview{},
		}
		c.JSON(int(statusCode), response)
	} else {
		response := Response{
			Status: "success",
			Error:  "",
			Data:   "deleted successfully",
		}
		c.JSON(http.StatusOK, response)
	}
}

// レビューの統計情報取得コントローラ
func (ctrl Controller) GetReviewStats(c *gin.Context) {
	var s service.Service
	stats, statusCode, err := s.GetReviewStats(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   []ResponseReview{},
		}
		c.JSON(int(statusCode), response)
	} else {
		response := Response{
			Status: "success",
			Error:  "",
			Data:   stats,
		}
		c.JSON(http.StatusOK, response)
	}
}
