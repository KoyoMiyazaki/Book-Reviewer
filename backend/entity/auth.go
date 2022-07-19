package entity

// ユーザ登録リクエスト用構造体
type RegisterRequest struct {
	Name                 string `json:"name" validate:"required"`
	Email                string `json:"email" validate:"required"`
	Password             string `json:"password" validate:"required"`
	PasswordConfirmation string `json:"passwordConfirmation" validate:"required"`
}

// ログインリクエスト用構造体
type LoginRequest struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// 認証関連レスポンス用構造体
type AuthResponse struct {
	Status string `json:"status"`
	Error  string `json:"error"`
	Data   any    `json:"data"`
}

// レスポンス用ユーザ構造体
type ResponseUser struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Token string `json:"token"`
}
