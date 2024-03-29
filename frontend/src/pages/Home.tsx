import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  Grid,
  IconButton,
  InputBase,
  MenuItem,
  Pagination,
  Rating,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Add, Close, Twitter } from "@mui/icons-material";
import axios, { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import Title from "../components/Title";
import ReviewCard from "../components/ReviewCard";
import { setToast } from "../slices/toastSlice";
import { logout } from "../slices/authSlice";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { Review, Status } from "../util/types";

const Home = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review>({
    id: -1,
    comment: "",
    rating: 0,
    readingStatus: Status.Reading,
    readPages: 0,
    startReadAt: "",
    finishReadAt: "",
    tags: "",
    bookTitle: "",
    bookAuthor: "",
    bookThumbnailLink: "",
    bookPublishedDate: "",
    bookNumOfPages: 0,
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
      if (error instanceof AxiosError) {
        if (error.response?.status === StatusCodes.UNAUTHORIZED) {
          dispatch(
            setToast({
              message: "ログインしてください",
              severity: "error",
            })
          );
          dispatch(logout());
          navigate("/login");
        } else {
          dispatch(
            setToast({
              message: error.response?.data.error,
              severity: "error",
            })
          );
        }
      }
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
      dispatch(
        setToast({
          message: "削除しました！",
          severity: "success",
        })
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === StatusCodes.UNAUTHORIZED) {
          dispatch(
            setToast({
              message: "ログインしてください",
              severity: "error",
            })
          );
          dispatch(logout());
          navigate("/login");
        } else {
          dispatch(
            setToast({
              message: error.response?.data.error,
              severity: "error",
            })
          );
        }
      }
    }
  };

  const updateReview = async () => {
    const postData = {
      comment: selectedReview.comment,
      rating: selectedReview.rating,
      readingStatus: selectedReview.readingStatus,
      readPages: selectedReview.readPages,
      startReadAt: selectedReview.startReadAt,
      finishReadAt: selectedReview.finishReadAt,
      tags: tags.join(","),
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
      dispatch(
        setToast({
          message: "更新しました！",
          severity: "success",
        })
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === StatusCodes.UNAUTHORIZED) {
          dispatch(
            setToast({
              message: "ログインしてください",
              severity: "error",
            })
          );
          dispatch(logout());
          navigate("/login");
        } else {
          dispatch(
            setToast({
              message: error.response?.data.error,
              severity: "error",
            })
          );
        }
      }
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

  const handleTagDelete = (id: number) => {
    setTags(tags.filter((_, idx) => idx !== id));
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
                    readingStatus={review.readingStatus}
                    readPages={review.readPages}
                    startReadAt={review.startReadAt}
                    finishReadAt={review.finishReadAt}
                    tags={review.tags}
                    bookTitle={review.bookTitle}
                    bookAuthor={review.bookAuthor}
                    bookThumbnailLink={review.bookThumbnailLink}
                    bookPublishedDate={review.bookPublishedDate}
                    bookNumOfPages={review.bookNumOfPages}
                    setSelectedReview={setSelectedReview}
                    setTags={setTags}
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
                <Tooltip title="閉じる">
                  <IconButton
                    onClick={handleClose}
                    sx={{
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    <Close />
                  </IconButton>
                </Tooltip>
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
                <Stack
                  direction="column"
                  sx={{ borderBottom: { md: "none", xs: "1px solid #CCC" } }}
                >
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
                      {"ステータス"}
                    </Typography>
                    <Select
                      value={selectedReview.readingStatus}
                      label="ステータス"
                      onChange={(event) => {
                        setSelectedReview((prev) => {
                          return {
                            ...prev,
                            readingStatus: event.target.value as Status,
                          };
                        });
                      }}
                    >
                      <MenuItem value={Status.Reading}>
                        {Status.Reading}
                      </MenuItem>
                      <MenuItem value={Status.Finish}>{Status.Finish}</MenuItem>
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {"読んだページ数"}
                    </Typography>
                    <TextField
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={selectedReview.readPages}
                      onChange={(event) => {
                        setSelectedReview((prev) => {
                          return {
                            ...prev,
                            readPages: Number(event.target.value),
                          };
                        });
                      }}
                    />
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {"読み始めた日"}
                      </Typography>
                      <TextField
                        type="date"
                        value={selectedReview.startReadAt}
                        onChange={(event) => {
                          setSelectedReview((prev) => {
                            return {
                              ...prev,
                              startReadAt: event.target.value,
                            };
                          });
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {"読み終わった日"}
                      </Typography>
                      <TextField
                        type="date"
                        value={selectedReview.finishReadAt}
                        onChange={(event) => {
                          setSelectedReview((prev) => {
                            return {
                              ...prev,
                              finishReadAt: event.target.value,
                            };
                          });
                        }}
                      />
                    </Box>
                  </Stack>
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
                    required
                    onChange={(event) => {
                      setSelectedReview((prev) => {
                        return {
                          ...prev,
                          comment: event.target.value,
                        };
                      });
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    <InputBase
                      placeholder="タグを入力"
                      inputProps={{ "aria-label": "add tag" }}
                      name="q"
                      sx={{
                        ml: 1,
                        width: "200px",
                        borderBottom: "1px solid black",
                      }}
                      value={tagsInput}
                      onInput={(e: any) => setTagsInput(e.target.value)}
                    />
                    <Tooltip title="タグを追加">
                      <IconButton
                        type="submit"
                        sx={{ p: "10px" }}
                        aria-label="add"
                        onClick={() => {
                          setTagsInput("");
                          setTags((prev) => [...prev, tagsInput]);
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    {tags.map((tag, idx) => (
                      <Tooltip title={tag} arrow>
                        <Chip
                          key={idx}
                          label={tag}
                          onDelete={() => handleTagDelete(idx)}
                          sx={{
                            maxWidth: "100px",
                            marginRight: "0.25rem",
                            marginBottom: "0.5rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
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
              <Tooltip title="ツイート">
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
              </Tooltip>
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
