package router

import (
	auth "github.com/KoyoMiyazaki/Book-Reviewer/controller"
	"github.com/gin-gonic/gin"
)

// Ginサーバ初期設定、および起動
func Init() error {
	r := router()
	return r.Run()
}

// Ginルータ設定
func router() *gin.Engine {
	r := gin.Default()

	// 認証関連のルーティング
	authRouter := r.Group("/auth")
	{
		controller := auth.Controller{}
		authRouter.POST("/register", controller.Register)
		authRouter.POST("/login", controller.Login)
		authRouter.GET("/whoami", controller.WhoAmI)
	}

	return r
}
