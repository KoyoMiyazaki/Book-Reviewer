package entity

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	FirstName string `gorm:"type:varchar(255);not null" json:"firstname" validate:"required"`
	LastName  string `gorm:"type:varchar(255);not null" json:"lastname" validate:"required"`
	Email     string `gorm:"type:varchar(255);unique;not null" json:"email" validate:"required,email"`
	CreatedAt int64  `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt int64  `gorm:"autoUpdateTime" json:"updatedAt"`
}
