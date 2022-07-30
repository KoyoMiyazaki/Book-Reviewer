package entity

// Bookモデルエンティティ
type Book struct {
	ID            uint   `gorm:"primaryKey"`
	Title         string `gorm:"type:varchar;not null;uniqueIndex:title_and_author_unique_idx"`
	Author        string `gorm:"type:varchar;not null;uniqueIndex:title_and_author_unique_idx"`
	ThumbnailLink string `gorm:"type:varchar"`
	PublishedDate string `gorm:"type:varchar"`
	NumOfPages    uint
	CreatedAt     int64 `gorm:"autoCreateTime"`
	UpdatedAt     int64 `gorm:"autoUpdateTime"`
}

// Google Books APIのレスポンス用構造体
type ResponseFromGoogleBooks struct {
	Items []BookDataFromGoogleBooks `json:"items"`
}

// Google Books APIのレスポンス用構造体(items配下)
type BookDataFromGoogleBooks struct {
	ID         string                    `json:"id"`
	VolumeInfo VolumeInfoFromGoogleBooks `json:"volumeInfo"`
}

// Google Books APIのレスポンス用構造体(volumeInfo配下)
type VolumeInfoFromGoogleBooks struct {
	Title         string                    `json:"title"`
	Authors       []string                  `json:"authors"`
	PublishedDate string                    `json:"publishedDate"`
	ImageLinks    ImageLinksFromGoogleBooks `json:"imageLinks"`
	PageCount     uint                      `json:"pageCount"`
}

// Google Books APIのレスポンス用構造体(imageLinks配下)
type ImageLinksFromGoogleBooks struct {
	Thumbnail string `json:"thumbnail"`
}

// 書籍検索レスポンス用構造体
type SearchResponse struct {
	ResponseBooks []ResponseBook `json:"data"`
}

// 書籍検索レスポンス用の書籍構造体
type ResponseBook struct {
	ID            string `json:"id"` // Google Books API のIDフィールド(string型)を使用するため、型はstring
	Title         string `json:"title"`
	Author        string `json:"author"`
	ThumbnailLink string `json:"thumbnailLink"`
	PublishedDate string `json:"publishedDate"`
	NumOfPages    uint   `json:"numOfPages"`
	IsReviewed    bool   `json:"isReviewed"`
}
