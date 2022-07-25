import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import {
  Button,
  Dialog,
  DialogActions,
  Grid,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Title from "../components/Title";
import { useAppSelector } from "../util/hooks";

const SearchResult = () => {
  const location = useLocation();
  const searchWord = location.search.split("=")[1];
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState({
    title: "",
    author: "",
    publishedDate: "",
    thumbnailLink: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(3);
  const [reviewComment, setReviewComment] = useState("");
  const user = useAppSelector((state) => state.auth.user);

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setRatingValue(3);
    setReviewComment("");
    setDialogOpen(false);
  };

  const postReviewComment = async () => {
    // post to backend
    const postData = {
      comment: reviewComment,
      rating: ratingValue,
      userEmail: user?.email,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      bookThumbnailLink: selectedBook.thumbnailLink,
      bookPublishedDate: selectedBook.publishedDate,
    };
    console.log(postData);
    try {
      const res = await axios.post("http://localhost:8080/review/", postData);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const getBooksData = async () => {
    //   https://developers.google.com/books/docs/v1/reference/volumes/list
    try {
      const res = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${searchWord}`
      );
      const data = await res.data;
      setBooks(data.items);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBooksData();
  }, [location]);

  return (
    <Stack direction="column" maxWidth="1000px" margin="0 auto">
      <Title title="Search Result" />
      <Grid container spacing={2} marginTop="1rem">
        {books.map((book) => {
          const bookInfo = book.volumeInfo;
          return (
            <Grid item xs={6}>
              <BookCard
                title={bookInfo.title}
                author={bookInfo.authors.join(", ")}
                publishedDate={bookInfo.publishedDate}
                thumbnailLink={
                  bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : ""
                }
                setSelectedBook={setSelectedBook}
                handleClickOpen={handleClickOpen}
              />
            </Grid>
          );
        })}
      </Grid>
      {/* ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            padding: "0.5rem 1rem",
          },
        }}
      >
        <Stack direction="column" spacing={2}>
          <Typography variant="body1" component="p" fontWeight={600}>
            {selectedBook.title}
          </Typography>
          <Stack direction="row" spacing={2}>
            <img
              src={selectedBook.thumbnailLink}
              alt={selectedBook.title}
              height={150}
            />
            <Stack direction="column">
              <Typography variant="body2" color="text.secondary">
                著者: {selectedBook.author}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                出版日: {selectedBook.publishedDate}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="column">
            <Typography variant="body2" color="text.secondary">
              Rating
            </Typography>
            <Rating
              name="half-rating"
              value={ratingValue}
              precision={0.5}
              onChange={(event, newValue) => {
                setRatingValue(newValue!);
              }}
            />
          </Stack>
          <TextField
            label="Review Comment"
            multiline
            rows={4}
            value={reviewComment}
            onChange={(event) => {
              setReviewComment(event.target.value);
            }}
          />
        </Stack>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={handleClose}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={postReviewComment}
            sx={{ textTransform: "none" }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default SearchResult;
