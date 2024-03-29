package controller

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	service "github.com/KoyoMiyazaki/Book-Reviewer/service"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type ResponseUser entity.ResponseUser

// ユーザ登録コントローラ
func (ctrl Controller) Register(c *gin.Context) {
	var s service.Service
	newUser, statusCode, err := s.Register(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseUser{},
		}
		c.JSON(int(statusCode), response)
	} else {
		token, statusCode, err := s.GenerateJwtToken(newUser)
		if err != nil {
			response := Response{
				Status: "error",
				Error:  err.Error(),
				Data:   ResponseUser{},
			}
			c.JSON(int(statusCode), response)
		} else {
			responseUser := ResponseUser{
				Name:  newUser.Name,
				Email: newUser.Email,
				Token: token,
			}
			response := Response{
				Status: "success",
				Error:  "",
				Data:   responseUser,
			}
			c.JSON(http.StatusCreated, response)
		}
	}

}

// ログインコントローラ
func (ctrl Controller) Login(c *gin.Context) {
	var s service.Service
	user, statusCode, err := s.Login(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseUser{},
		}
		c.JSON(int(statusCode), response)
	} else {
		token, statusCode, err := s.GenerateJwtToken(user)
		if err != nil {
			response := Response{
				Status: "error",
				Error:  err.Error(),
				Data:   ResponseUser{},
			}
			c.JSON(int(statusCode), response)
		} else {
			responseUser := ResponseUser{
				Name:  user.Name,
				Email: user.Email,
				Token: token,
			}
			response := Response{
				Status: "success",
				Error:  "",
				Data:   responseUser,
			}
			c.JSON(http.StatusOK, response)
		}
	}
}

// アカウント更新コントローラ
func (ctrl Controller) UpdateAccount(c *gin.Context) {
	var s service.Service
	updatedUser, statusCode, err := s.UpdateAccount(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseUser{},
		}
		c.JSON(int(statusCode), response)
	} else {
		token, statusCode, err := s.GenerateJwtToken(updatedUser)
		if err != nil {
			response := Response{
				Status: "error",
				Error:  err.Error(),
				Data:   ResponseUser{},
			}
			c.JSON(int(statusCode), response)
		} else {
			responseUser := ResponseUser{
				Name:  updatedUser.Name,
				Email: updatedUser.Email,
				Token: token,
			}
			response := Response{
				Status: "success",
				Error:  "",
				Data:   responseUser,
			}
			c.JSON(http.StatusOK, response)
		}
	}
}

// アカウント削除コントローラ
func (ctrl Controller) DeleteAccount(c *gin.Context) {
	var s service.Service
	statusCode, err := s.DeleteAccount(c)

	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseUser{},
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

func (ctrl Controller) WhoAmI(c *gin.Context) {
	var s service.Service
	authHeader := c.Request.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, statusCode, err := s.VerifyToken(tokenString)
	if err != nil {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseUser{},
		}
		c.JSON(int(statusCode), response)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		response := Response{
			Status: "success",
			Error:  "",
			Data:   fmt.Sprintf("Your name is %s", claims["name"]),
		}
		c.JSON(http.StatusOK, response)
	} else {
		response := Response{
			Status: "error",
			Error:  err.Error(),
			Data:   ResponseUser{},
		}
		c.JSON(http.StatusForbidden, response)
	}
}
