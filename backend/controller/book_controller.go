package controller

import (
	"net/http"

	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	service "github.com/KoyoMiyazaki/Book-Reviewer/service"
	"github.com/gin-gonic/gin"
)

type ResponseBook entity.ResponseBook

// 書籍検索コントローラ
func (ctrl Controller) SearchBooks(c *gin.Context) {
	var s service.Service
	books, statusCode, err := s.SearchBooks(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   []ResponseBook{},
		}
		c.JSON(int(statusCode), response)
	} else {
		response := Response{
			Status: "success",
			Error:  "",
			Data:   books,
		}
		c.JSON(http.StatusOK, response)
	}
}
