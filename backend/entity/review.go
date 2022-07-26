package entity

// レビューモデルエンティティ
type Review struct {
	ID        uint   `gorm:"primaryKey"`
	Comment   string `gorm:"type:text"`
	Rating    uint8
	CreatedAt int64 `gorm:"autoCreateTime"`
	UpdatedAt int64 `gorm:"autoUpdateTime"`
	UserID    uint
	User      User `gorm:"constraint:OnDelete:CASCADE"`
	BookID    uint
	Book      Book `gorm:"constraint:OnDelete:CASCADE"`
}

// レビュー登録リクエスト用構造体
type CreateReviewRequest struct {
	Comment           string `json:"comment" validate:"required"`
	Rating            uint8  `json:"rating" validate:"required"`
	BookTitle         string `json:"bookTitle" validate:"required"`
	BookAuthor        string `json:"bookAuthor" validate:"required"`
	BookThumbnailLink string `json:"bookThumbnailLink"`
	BookPublishedDate string `json:"bookPublishedDate"`
}

// レスポンス用レビュー構造体
type ResponseReview struct {
	Comment           string `json:"comment"`
	Rating            uint8  `json:"rating"`
	BookTitle         string `json:"bookTitle"`
	BookAuthor        string `json:"bookAuthor"`
	BookThumbnailLink string `json:"bookThumbnailLink"`
	BookPublishedDate string `json:"bookPublishedDate"`
}
