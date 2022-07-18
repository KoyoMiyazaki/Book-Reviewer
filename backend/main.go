package main

import (
	"fmt"

	"github.com/KoyoMiyazaki/Book-Reviewer/db"
	"github.com/KoyoMiyazaki/Book-Reviewer/router"
)

func main() {
	if err := db.Init(); err != nil {
		fmt.Println(err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	if err := router.Init(); err != nil {
		fmt.Println(err)
	}
}
