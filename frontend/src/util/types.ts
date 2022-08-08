export interface Book {
  title: string;
  author: string;
  thumbnailLink: string;
  publishedDate: string;
  numOfPages: number;
  isForSale: boolean;
  buyLink: string;
}

export interface Review {
  id: number;
  comment: string;
  rating: number;
  readingStatus: Status;
  readPages: number;
  startReadAt: string;
  finishReadAt: string;
  bookTitle: string;
  bookAuthor: string;
  bookThumbnailLink: string;
  bookPublishedDate: string;
  bookNumOfPages: number;
}

export const Status = {
  Reading: "Reading",
  Finish: "Finish",
} as const;
export type Status = typeof Status[keyof typeof Status];

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

export interface UpdateAccountInput {
  password: string;
  newName: string | undefined;
  newEmail: string | undefined;
  newPassword: string;
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
  readingStatus: Status;
  readPages: number;
  startReadAt: string;
  finishReadAt: string;
  bookTitle: string;
  bookAuthor: string;
  bookThumbnailLink: string;
  bookPublishedDate: string;
  bookNumOfPages: number;
  setSelectedReview: React.Dispatch<React.SetStateAction<Review>>;
  handleClickOpen: () => void;
}

export interface TitleProps {
  title: string;
}
