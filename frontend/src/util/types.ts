export interface Book {
  title: string;
  author: string;
  thumbnailLink: string;
  publishedDate: string;
}

export interface Review {
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
  setSelectedBook: React.Dispatch<React.SetStateAction<Book>>;
  handleClickOpen: () => void;
}

export interface ReviewCardProps {
  comment: string;
  rating: number;
  bookTitle: string;
  bookAuthor: string;
  bookThumbnailLink: string;
  bookPublishedDate: string;
}

export interface TitleProps {
  title: string;
}
