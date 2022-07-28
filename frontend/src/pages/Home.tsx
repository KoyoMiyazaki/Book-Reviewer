import React, { useEffect, useState } from "react";
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
import axios from "axios";
import Title from "../components/Title";
import ReviewCard from "../components/ReviewCard";
import { Review } from "../util/types";
import { useAppSelector } from "../util/hooks";

const Home = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review>({
    id: -1,
    comment: "",
    rating: 0,
    bookTitle: "",
    bookAuthor: "",
    bookThumbnailLink: "",
    bookPublishedDate: "",
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const user = useAppSelector((state) => state.auth.user);

  const getReviews = async () => {
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      const res = await axios.get("http://localhost:8080/review/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data.data;
      setReviews(data ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteReview = async () => {
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      const res = await axios.delete(
        `http://localhost:8080/review/${selectedReview.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDialogOpen(false);
      getReviews();
    } catch (error) {
      console.log(error);
    }
  };

  const updateReview = async () => {
    const postData = {
      comment: selectedReview.comment,
      rating: selectedReview.rating,
    };
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      const res = await axios.patch(
        `http://localhost:8080/review/${selectedReview.id}`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDialogOpen(false);
      getReviews();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getReviews();
  }, []);

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <Stack direction="column" maxWidth="1000px" margin="0 auto">
      {!user ? (
        <Title title="Please Login" />
      ) : reviews.length === 0 ? (
        <Title title="Let's search books you want to review!" />
      ) : (
        <>
          <Title title="Your Review" />
          <Grid container spacing={2} marginTop="1rem">
            {reviews.map((review) => {
              return (
                <Grid item xs={12} sm={6} key={review.id}>
                  <ReviewCard
                    id={review.id}
                    comment={review.comment}
                    rating={review.rating}
                    bookTitle={review.bookTitle}
                    bookAuthor={review.bookAuthor}
                    bookThumbnailLink={review.bookThumbnailLink}
                    bookPublishedDate={review.bookPublishedDate}
                    setSelectedReview={setSelectedReview}
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
                {selectedReview.bookTitle}
              </Typography>
              <Stack direction="row" spacing={2}>
                <img
                  src={selectedReview.bookThumbnailLink}
                  alt={selectedReview.bookTitle}
                  height={150}
                />
                <Stack direction="column">
                  <Typography variant="body2" color="text.secondary">
                    著者: {selectedReview.bookAuthor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    出版日: {selectedReview.bookPublishedDate}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="column">
                <Typography variant="body2" color="text.secondary">
                  Rating
                </Typography>
                <Rating
                  name="rating"
                  value={selectedReview.rating}
                  precision={0.5}
                  onChange={(event, newValue) => {
                    setSelectedReview((prev) => {
                      return {
                        ...prev,
                        rating: newValue ? newValue : 3,
                      };
                    });
                  }}
                />
              </Stack>
              <TextField
                label="Review Comment"
                multiline
                rows={4}
                name="comment"
                value={selectedReview.comment}
                onChange={(event) => {
                  setSelectedReview((prev) => {
                    return {
                      ...prev,
                      comment: event.target.value,
                    };
                  });
                }}
              />
            </Stack>

            <DialogActions>
              <Button
                variant="contained"
                color="error"
                onClick={deleteReview}
                sx={{ textTransform: "none" }}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={updateReview}
                sx={{ textTransform: "none" }}
              >
                Update
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Stack>
  );
};

export default Home;
