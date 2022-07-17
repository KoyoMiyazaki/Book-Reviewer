package main

import (
	"fmt"

	"github.com/KoyoMiyazaki/Book-Reviewer/db"
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

}
