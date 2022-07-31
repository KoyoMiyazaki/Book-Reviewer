package entity

// Userモデルエンティティ
type User struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"type:varchar(255);not null"`
	Email     string `gorm:"type:varchar(255);unique;not null"`
	Password  string `gorm:"type:varchar;not null"`
	CreatedAt int64  `gorm:"autoCreateTime"`
	UpdatedAt int64  `gorm:"autoUpdateTime"`
}

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

// ユーザアカウント更新リクエスト用構造体
type UpdateAccountRequest struct {
	Password    string `json:"password" validate:"required"`
	NewName     string `json:"newName" validate:"required"`
	NewEmail    string `json:"newEmail" validate:"required"`
	NewPassword string `json:"newPassword" validate:"required"`
}

// レスポンス用ユーザ構造体
type ResponseUser struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Token string `json:"token"`
}
