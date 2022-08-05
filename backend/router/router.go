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
		AllowMethods: []string{"GET", "POST", "PATCH", "DELETE"},
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
		reviewRouter.PATCH("/:id", controller.UpdateReview)
		reviewRouter.DELETE("/:id", controller.DeleteReview)
		reviewRouter.GET("/statistics", controller.GetReviewStats)
	}

	// 書籍関連のルーティング
	bookRouter := r.Group("/book")
	{
		// /book?search=[検索ワード]
		bookRouter.GET("/", controller.SearchBooks)
	}

	// 認証関連のルーティング
	authRouter := r.Group("/auth")
	{
		authRouter.POST("/register", controller.Register)
		authRouter.POST("/login", controller.Login)
		authRouter.PATCH("/account", controller.UpdateAccount)
		authRouter.DELETE("/account", controller.DeleteAccount)
		authRouter.GET("/whoami", controller.WhoAmI)
	}

	return r
}
