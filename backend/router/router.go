package router

import (
	auth "github.com/KoyoMiyazaki/Book-Reviewer/controller"
	"github.com/gin-gonic/gin"
)

func Init() error {
	r := router()
	return r.Run()
}

func router() *gin.Engine {
	r := gin.Default()

	authRouter := r.Group("/auth")
	{
		controller := auth.Controller{}
		authRouter.POST("/register", controller.Register)
		authRouter.POST("/login", controller.Login)
		authRouter.GET("/whoami", controller.WhoAmI)
	}

	return r
}
