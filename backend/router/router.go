package router

import (
	"time"

	controller "github.com/KoyoMiyazaki/Book-Reviewer/controller"
	"github.com/gin-contrib/cors"
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

	// CORS設定
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST"},
		AllowHeaders: []string{
			"Authorization",
			"Content-Type",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	controller := controller.Controller{}
	// レビュー関連のルーティング
	reviewRouter := r.Group("/review")
	{
		reviewRouter.GET("/", controller.GetReviews)
		reviewRouter.POST("/", controller.CreateReview)
		reviewRouter.DELETE("/:id", controller.DeleteReview)
	}

	// 認証関連のルーティング
	authRouter := r.Group("/auth")
	{
		authRouter.POST("/register", controller.Register)
		authRouter.POST("/login", controller.Login)
		authRouter.GET("/whoami", controller.WhoAmI)
	}

	return r
}
