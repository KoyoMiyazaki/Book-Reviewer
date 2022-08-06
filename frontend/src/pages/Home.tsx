import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  Grid,
  IconButton,
  Pagination,
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
import { Close, Twitter } from "@mui/icons-material";

const Home = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review>({
    id: -1,
    comment: "",
    rating: 0,
    readAt: "",
    bookTitle: "",
    bookAuthor: "",
    bookThumbnailLink: "",
    bookPublishedDate: "",
    bookNumOfPages: 0,
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const user = useAppSelector((state) => state.auth.user);

  const getReviews = async () => {
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      const res = await axios.get("http://localhost:8080/review/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
        },
      });
      const { items, totalPages } = await res.data.data;
      setReviews(items ? items : []);
      setTotalPages(totalPages ? totalPages : 1);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteReview = async () => {
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      await axios.delete(`http://localhost:8080/review/${selectedReview.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      await axios.patch(
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
  }, [currentPage]);

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const tweetComment = () => {
    const tweetContent = `[${selectedReview.bookTitle}]\n${selectedReview.comment}`;
    const encodedTweetContent = encodeURI(tweetContent);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodedTweetContent}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <Stack direction="column" maxWidth="1000px" margin="0 auto">
      {!user ? (
        <Title title="ログインしてください" />
      ) : reviews.length === 0 ? (
        <Title title="レビューしたい書籍を検索してみよう！" />
      ) : (
        <Box>
          <Title title="レビュー一覧" />
          <Grid container spacing={2} marginTop="1rem">
            {reviews.map((review) => {
              return (
                <Grid item xs={12} sm={6} key={review.id}>
                  <ReviewCard
                    id={review.id}
                    comment={review.comment}
                    rating={review.rating}
                    readAt={review.readAt}
                    bookTitle={review.bookTitle}
                    bookAuthor={review.bookAuthor}
                    bookThumbnailLink={review.bookThumbnailLink}
                    bookPublishedDate={review.bookPublishedDate}
                    bookNumOfPages={review.bookNumOfPages}
                    setSelectedReview={setSelectedReview}
                    handleClickOpen={handleClickOpen}
                  />
                </Grid>
              );
            })}
          </Grid>
          {/* ページネーション */}
          <Pagination
            count={totalPages}
            size="large"
            variant="outlined"
            color="primary"
            sx={{
              marginTop: "1.5rem",
              "& .MuiPagination-ul": { justifyContent: "center" },
            }}
            onChange={(event, page) => {
              setCurrentPage(page);
            }}
          />
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
            <Grid container rowSpacing={2}>
              <Grid item xs={12}>
                <IconButton
                  onClick={handleClose}
                  sx={{
                    width: "30px",
                    height: "30px",
                  }}
                >
                  <Close />
                </IconButton>
              </Grid>
              <Grid
                item
                xs={4}
                sx={{ display: { md: "none", xs: "block" } }}
              ></Grid>
              <Grid item md={3} xs={4}>
                <Box
                  component="img"
                  src={selectedReview.bookThumbnailLink}
                  alt={selectedReview.bookTitle}
                  height={150}
                  display="block"
                  margin="0 auto"
                />
              </Grid>
              <Grid item md={9} xs={12}>
                <Stack direction="column">
                  <Typography variant="body1" component="p" fontWeight={600}>
                    {selectedReview.bookTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`著者: ${selectedReview.bookAuthor}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`出版日: ${selectedReview.bookPublishedDate}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`ページ数: ${selectedReview.bookNumOfPages}`}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="column" spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {"読んだ日"}
                    </Typography>
                    <TextField
                      type="date"
                      value={selectedReview.readAt}
                      onChange={(event) => {
                        setSelectedReview((prev) => {
                          return {
                            ...prev,
                            readAt: event.target.value,
                          };
                        });
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {"評価"}
                    </Typography>
                    <Rating
                      name="rating"
                      size="medium"
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
                  </Box>
                  <TextField
                    label="コメント"
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
              </Grid>
            </Grid>

            <DialogActions
              sx={{ justifyContent: "space-between", paddingX: 0 }}
            >
              <Button
                variant="contained"
                startIcon={<Twitter />}
                onClick={tweetComment}
                sx={{
                  display: { md: "flex", xs: "none" },
                  backgroundColor: "#1d9bf0",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#0c7abf",
                  },
                }}
              >
                {"ツイート"}
              </Button>
              <IconButton
                onClick={tweetComment}
                sx={{
                  display: { md: "none" },
                  width: "35px",
                  height: "35px",
                  color: "white",
                  backgroundColor: "#1d9bf0",
                  "&:hover": {
                    backgroundColor: "#1d9bf0",
                  },
                }}
              >
                <Twitter />
              </IconButton>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={deleteReview}
                  sx={{ textTransform: "none" }}
                >
                  {"削除"}
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={updateReview}
                  sx={{ textTransform: "none" }}
                >
                  {"更新"}
                </Button>
              </Stack>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Stack>
  );
};

export default Home;
