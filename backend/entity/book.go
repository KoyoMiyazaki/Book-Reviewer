package entity

// Bookモデルエンティティ
type Book struct {
	ID            uint   `gorm:"primaryKey"`
	Title         string `gorm:"type:varchar;not null;unique"`
	Author        string `gorm:"type:varchar;not null;unique"`
	ThumbnailLink string `gorm:"type:varchar"`
	PublishedDate string `gorm:"type:varchar"`
	CreatedAt     int64  `gorm:"autoCreateTime"`
	UpdatedAt     int64  `gorm:"autoUpdateTime"`
}
