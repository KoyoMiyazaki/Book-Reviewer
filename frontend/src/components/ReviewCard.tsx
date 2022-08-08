import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { ReviewCardProps, Status } from "../util/types";

const ReviewCard = ({
  id,
  comment,
  rating,
  readingStatus,
  startReadAt,
  finishReadAt,
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
      sx={{
        maxWidth: { md: "400px", xs: "100%" },
        padding: "0.5rem",
      }}
    >
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={2}>
          <img src={bookThumbnailLink} alt={bookTitle} height={175} />
          <Stack spacing={0.5} direction="column" sx={{ width: "100%" }}>
            <Typography
              variant="body1"
              component="p"
              fontWeight={600}
              sx={{ borderBottom: "1px solid #CCC" }}
            >
              {bookTitle}
            </Typography>
            <Box>
              <Chip
                label={readingStatus}
                color={readingStatus === Status.Finish ? "error" : "primary"}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="body2" component="p" fontWeight={600}>
                {"読み始めた日:"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {startReadAt}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" component="p" fontWeight={600}>
                {"読み終わった日:"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {finishReadAt}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" component="p" fontWeight={600}>
                {"評価:"}
              </Typography>
              <Rating
                name="half-rating"
                size="small"
                value={rating}
                precision={0.5}
                readOnly
              />
            </Box>
            <Box>
              <Typography variant="body2" component="p" fontWeight={600}>
                {"コメント:"}
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
              readingStatus,
              startReadAt,
              finishReadAt,
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
          {"レビューを見る"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ReviewCard;
