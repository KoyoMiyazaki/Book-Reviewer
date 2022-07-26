import { Paper, Rating, Stack, Typography } from "@mui/material";
import React from "react";

export interface ReviewCardProps {
  comment: string;
  rating: number;
  bookTitle: string;
  bookAuthor: string;
  bookThumbnailLink: string;
  bookPublishedDate: string;
}

const ReviewCard = ({
  comment,
  rating,
  bookTitle,
  bookAuthor,
  bookThumbnailLink,
  bookPublishedDate,
}: ReviewCardProps) => {
  return (
    <Paper elevation={3} sx={{ maxWidth: "400px", padding: "0.5rem" }}>
      <Stack direction="column" spacing={2}>
        <Typography variant="body1" component="p" fontWeight={600}>
          {bookTitle}
        </Typography>
        <Stack direction="row" spacing={2}>
          <img src={bookThumbnailLink} alt={bookTitle} height={150} />
          <Stack direction="column">
            <Typography variant="body2" color="text.secondary">
              著者: {bookAuthor}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              出版日: {bookPublishedDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              評価:
            </Typography>
            <Rating
              name="half-rating"
              value={rating}
              precision={0.5}
              readOnly
            />
            <Typography variant="body2" color="text.secondary">
              レビュー:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {comment}
            </Typography>
          </Stack>
        </Stack>
        {/* <Button
          variant="contained"
          color="success"
          onClick={() => {
            setSelectedBook({ title, author, publishedDate, thumbnailLink });
            handleClickOpen();
          }}
          sx={{ textTransform: "none" }}
        >
          Review This Book
        </Button> */}
      </Stack>
    </Paper>
  );
};

export default ReviewCard;
