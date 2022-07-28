import React from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { BookCardProps } from "../util/types";

const BookCard = ({
  title,
  author,
  thumbnailLink,
  publishedDate,
  setSelectedBook,
  handleClickOpen,
}: BookCardProps) => {
  return (
    <Paper
      elevation={3}
      sx={{ maxWidth: { md: "400px", xs: "100%" }, padding: "0.5rem" }}
    >
      <Stack direction="column" spacing={2}>
        <Typography variant="body1" component="p" fontWeight={600}>
          {title}
        </Typography>
        <Stack direction="row" spacing={2}>
          <img src={thumbnailLink} alt={title} height={150} />
          <Stack direction="column">
            <Typography variant="body2" color="text.secondary">
              著者: {author}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              出版日: {publishedDate}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            setSelectedBook({ title, author, publishedDate, thumbnailLink });
            handleClickOpen();
          }}
          sx={{ textTransform: "none" }}
        >
          Review This Book
        </Button>
      </Stack>
    </Paper>
  );
};

export default BookCard;
