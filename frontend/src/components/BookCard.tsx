import React from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { BookCardProps } from "../util/types";

const BookCard = ({
  title,
  author,
  thumbnailLink,
  publishedDate,
  numOfPages,
  isReviewed,
  setSelectedBook,
  handleClickOpen,
}: BookCardProps) => {
  return (
    <Paper
      elevation={3}
      sx={{ maxWidth: { md: "400px", xs: "100%" }, padding: "0.5rem" }}
    >
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={2}>
          <img src={thumbnailLink} alt={title} height={150} />
          <Stack direction="column">
            <Typography variant="body1" component="p" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`著者: ${author}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`出版日: ${publishedDate}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`ページ数: ${numOfPages}`}
            </Typography>
          </Stack>
        </Stack>
        {isReviewed ? (
          <Button variant="contained" disabled sx={{ textTransform: "none" }}>
            {"レビュー済み"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="success"
            onClick={() => {
              setSelectedBook({
                title,
                author,
                thumbnailLink,
                publishedDate,
                numOfPages,
              });
              handleClickOpen();
            }}
            sx={{ textTransform: "none" }}
          >
            {"レビューを入力する"}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default BookCard;
