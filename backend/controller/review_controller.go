package controller

import (
	"net/http"

	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	service "github.com/KoyoMiyazaki/Book-Reviewer/service"
	"github.com/gin-gonic/gin"
)

type ResponseReview entity.ResponseReview

// レビュー登録コントローラ
func (ctrl Controller) CreateReview(c *gin.Context) {
	var s service.Service
	newReview, statusCode, err := s.CreateReview(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   entity.ResponseReview{},
		}
		c.JSON(int(statusCode), response)
	} else {
		responseReview := ResponseReview{
			Comment: newReview.Comment,
			Rating:  newReview.Rating,
		}
		response := Response{
			Status: "success",
			Error:  "",
			Data:   entity.ResponseReview(responseReview),
		}
		c.JSON(http.StatusCreated, response)
	}
}
