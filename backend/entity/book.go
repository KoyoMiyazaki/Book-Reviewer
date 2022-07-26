package entity

// Bookモデルエンティティ
type Book struct {
	ID            uint   `gorm:"primaryKey"`
	Title         string `gorm:"type:varchar;not null;uniqueIndex:title_and_author_unique_idx"`
	Author        string `gorm:"type:varchar;not null;uniqueIndex:title_and_author_unique_idx"`
	ThumbnailLink string `gorm:"type:varchar"`
	PublishedDate string `gorm:"type:varchar"`
	CreatedAt     int64  `gorm:"autoCreateTime"`
	UpdatedAt     int64  `gorm:"autoUpdateTime"`
}
