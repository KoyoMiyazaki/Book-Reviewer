package entity

// レビューモデルエンティティ
type Review struct {
	ID        uint   `gorm:"primaryKey"`
	Comment   string `gorm:"type:text"`
	Rating    float64
	CreatedAt int64 `gorm:"autoCreateTime"`
	UpdatedAt int64 `gorm:"autoUpdateTime"`
	UserID    uint
	User      User `gorm:"constraint:OnDelete:CASCADE"`
	BookID    uint
	Book      Book `gorm:"constraint:OnDelete:CASCADE"`
}

// レビュー登録リクエスト用構造体
type CreateReviewRequest struct {
	Comment           string  `json:"comment" validate:"required"`
	Rating            float64 `json:"rating" validate:"required,gte=0.5,lte=5.0"`
	BookTitle         string  `json:"bookTitle" validate:"required"`
	BookAuthor        string  `json:"bookAuthor" validate:"required"`
	BookThumbnailLink string  `json:"bookThumbnailLink"`
	BookPublishedDate string  `json:"bookPublishedDate"`
}

// レビュー更新リクエスト用構造体
type UpdateReviewRequest struct {
	Comment string  `json:"comment" validate:"required"`
	Rating  float64 `json:"rating" validate:"required,gte=0.5,lte=5.0"`
}

// レスポンス用レビュー構造体
type ResponseReview struct {
	ID                uint    `json:"id"`
	Comment           string  `json:"comment"`
	Rating            float64 `json:"rating"`
	BookTitle         string  `json:"bookTitle"`
	BookAuthor        string  `json:"bookAuthor"`
	BookThumbnailLink string  `json:"bookThumbnailLink"`
	BookPublishedDate string  `json:"bookPublishedDate"`
}
