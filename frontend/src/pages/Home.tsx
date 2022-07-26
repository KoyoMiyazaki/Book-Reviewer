import React, { useEffect, useState } from "react";
import { Grid, Stack } from "@mui/material";
import Title from "../components/Title";
import axios from "axios";
import ReviewCard from "../components/ReviewCard";
import { Review } from "../util/types";

const Home = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

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

  useEffect(() => {
    getReviews();
  }, []);

  return (
    <Stack direction="column" maxWidth="1000px" margin="0 auto">
      <Title title="Your Review" />
      <Grid container spacing={2} marginTop="1rem">
        {reviews.map((review) => {
          return (
            <Grid item xs={6}>
              <ReviewCard
                comment={review.comment}
                rating={review.rating}
                bookTitle={review.bookTitle}
                bookAuthor={review.bookAuthor}
                bookThumbnailLink={review.bookThumbnailLink}
                bookPublishedDate={review.bookPublishedDate}
              />
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};

export default Home;
