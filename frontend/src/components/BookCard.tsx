import React from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";

export interface BookCardProps {
  title: string;
  thumbnailLink: string;
  author: string;
  publishedDate: string;
}

const BookCard = ({
  title,
  thumbnailLink,
  author,
  publishedDate,
}: BookCardProps) => {
  return (
    <Paper elevation={3} sx={{ maxWidth: "500px", padding: "0.5rem" }}>
      <Typography variant="body1" component="p" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        著者: {author}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        出版日: {publishedDate}
      </Typography>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ position: "relative" }}
      >
        <img src={thumbnailLink} alt={title} height={150} />
        <Button
          variant="contained"
          color="success"
          sx={{ height: "50px", position: "absolute", bottom: 0, right: 0 }}
        >
          Review
        </Button>
      </Stack>
    </Paper>
  );
};

export default BookCard;
