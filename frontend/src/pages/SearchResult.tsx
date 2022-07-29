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
import { Book } from "../util/types";

const SearchResult = () => {
  const location = useLocation();
  const searchWord = location.search.split("=")[1];
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book>({
    title: "",
    author: "",
    thumbnailLink: "",
    publishedDate: "",
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [ratingValue, setRatingValue] = useState<number>(3);
  const [reviewComment, setReviewComment] = useState<string>("");
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
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      const res = await axios.post("http://localhost:8080/review/", postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const getBooksData = async () => {
    try {
      let res;
      if (!user) {
        res = await axios.get(`http://localhost:8080/book/`, {
          params: {
            search: searchWord,
          },
        });
      } else {
        const token: string | null = localStorage.getItem("jwtToken");
        res = await axios.get(`http://localhost:8080/book/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: searchWord,
          },
        });
      }
      const data = await res.data;
      setBooks(data.data);
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
          return (
            <Grid item key={book.id} xs={12} sm={6}>
              <BookCard
                title={book.title}
                author={book.author}
                thumbnailLink={book.thumbnailLink}
                publishedDate={book.publishedDate}
                isReviewed={book.isReviewed}
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
