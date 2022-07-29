export interface Book {
  title: string;
  author: string;
  thumbnailLink: string;
  publishedDate: string;
}

export interface Review {
  id: number;
  comment: string;
  rating: number;
  bookTitle: string;
  bookAuthor: string;
  bookThumbnailLink: string;
  bookPublishedDate: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface BookCardProps extends Book {
  isReviewed: boolean;
  setSelectedBook: React.Dispatch<React.SetStateAction<Book>>;
  handleClickOpen: () => void;
}

export interface ReviewCardProps {
  id: number;
  comment: string;
  rating: number;
  bookTitle: string;
  bookAuthor: string;
  bookThumbnailLink: string;
  bookPublishedDate: string;
  setSelectedReview: React.Dispatch<React.SetStateAction<Review>>;
  handleClickOpen: () => void;
}

export interface TitleProps {
  title: string;
}
