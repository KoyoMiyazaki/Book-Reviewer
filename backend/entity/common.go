package entity

// レスポンス用構造体
type Response struct {
	Status string `json:"status"`
	Error  string `json:"error"`
	Data   any    `json:"data"`
}
