package auth

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/KoyoMiyazaki/Book-Reviewer/entity"
	auth "github.com/KoyoMiyazaki/Book-Reviewer/service"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type Controller struct{}
type User entity.User
type AuthResponse entity.AuthResponse
type ResponseUser entity.ResponseUser

func (ctrl Controller) Register(c *gin.Context) {
	var s auth.Service
	newUser, err := s.Register(c)

	if err != nil {
		response := AuthResponse{
			Status: "error",
			Error:  err.Error(),
			Data:   entity.ResponseUser{},
		}
		c.JSON(http.StatusBadRequest, response)
		fmt.Println(err)
	} else {
		token, err := s.GenerateJwtToken(newUser)
		if err != nil {
			response := AuthResponse{
				Status: "error",
				Error:  err.Error(),
				Data:   entity.ResponseUser{},
			}
			c.JSON(http.StatusBadRequest, response)
			fmt.Println(err)
		} else {
			responseUser := ResponseUser{
				Name:  newUser.Name,
				Email: newUser.Email,
				Token: token,
			}
			response := AuthResponse{
				Status: "success",
				Error:  "",
				Data:   entity.ResponseUser(responseUser),
			}
			c.JSON(http.StatusOK, response)
		}
	}

}

func (ctrl Controller) Login(c *gin.Context) {
	var s auth.Service
	user, err := s.Login(c)

	if err != nil {
		response := AuthResponse{
			Status: "error",
			Error:  err.Error(),
			Data:   entity.ResponseUser{},
		}
		c.JSON(http.StatusBadRequest, response)
		fmt.Println(err)
	} else {
		token, err := s.GenerateJwtToken(user)
		if err != nil {
			response := AuthResponse{
				Status: "error",
				Error:  err.Error(),
				Data:   entity.ResponseUser{},
			}
			c.JSON(http.StatusBadRequest, response)
			fmt.Println(err)
		} else {
			responseUser := ResponseUser{
				Name:  user.Name,
				Email: user.Email,
				Token: token,
			}
			response := AuthResponse{
				Status: "success",
				Error:  "",
				Data:   entity.ResponseUser(responseUser),
			}
			c.JSON(http.StatusOK, response)
		}
	}
}

func (ctrl Controller) WhoAmI(c *gin.Context) {
	var s auth.Service
	authHeader := c.Request.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, err := s.VerifyToken(tokenString)
	if err != nil {
		response := AuthResponse{
			Status: "error",
			Error:  err.Error(),
			Data:   entity.ResponseUser{},
		}
		c.JSON(http.StatusBadRequest, response)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		response := AuthResponse{
			Status: "success",
			Error:  "",
			Data:   fmt.Sprintf("Your name is %s", claims["name"]),
		}
		c.JSON(http.StatusOK, response)
	} else {
		response := AuthResponse{
			Status: "error",
			Error:  err.Error(),
			Data:   entity.ResponseUser{},
		}
		c.JSON(http.StatusBadRequest, response)
	}
}
