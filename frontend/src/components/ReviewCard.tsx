import React from "react";
import { Box, Button, Paper, Rating, Stack, Typography } from "@mui/material";
import { ReviewCardProps } from "../util/types";

const ReviewCard = ({
  id,
  comment,
  rating,
  bookTitle,
  bookAuthor,
  bookThumbnailLink,
  bookPublishedDate,
  bookNumOfPages,
  setSelectedReview,
  handleClickOpen,
}: ReviewCardProps) => {
  // 20文字以下のコメントはそのままで、それより多いコメントは最初の20文字と3点リーダーを返却
  const shortenComment = (comment: string): string => {
    return comment.length <= 20 ? comment : `${comment.slice(0, 20)}...`;
  };

  return (
    <Paper
      elevation={3}
      sx={{ maxWidth: { md: "400px", xs: "100%" }, padding: "0.5rem" }}
    >
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={2}>
          <img src={bookThumbnailLink} alt={bookTitle} height={150} />
          <Stack spacing={1} direction="column" sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: "1px solid #CCC" }}>
              <Typography variant="body1" component="p" fontWeight={600}>
                {bookTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                著者: {bookAuthor}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                出版日: {bookPublishedDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ページ数: {bookNumOfPages}
              </Typography>
            </Box>
            <Box>
              <Rating
                name="half-rating"
                size="small"
                value={rating}
                precision={0.5}
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                レビュー:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {shortenComment(comment)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <Button
          variant="outlined"
          color="success"
          onClick={() => {
            setSelectedReview({
              id,
              comment,
              rating,
              bookTitle,
              bookAuthor,
              bookThumbnailLink,
              bookPublishedDate,
              bookNumOfPages,
            });
            handleClickOpen();
          }}
          sx={{ textTransform: "none" }}
        >
          Show Review
        </Button>
      </Stack>
    </Paper>
  );
};

export default ReviewCard;
