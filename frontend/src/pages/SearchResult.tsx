import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
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
  Rating,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Title from "../components/Title";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { Book, Status } from "../util/types";
import { Add, Close, Shop } from "@mui/icons-material";
import { setToast } from "../slices/toastSlice";
import { StatusCodes } from "http-status-codes";
import { logout } from "../slices/authSlice";

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
    numOfPages: 0,
    isForSale: false,
    buyLink: "",
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [ratingValue, setRatingValue] = useState<number>(3);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [readingStatus, setReadingStatus] = useState<Status>(Status.Reading);
  const [readPages, setReadPages] = useState<number>(0);
  const [startReadAt, setStartReadAt] = useState<string>("");
  const [finishReadAt, setFinishReadAt] = useState<string>("");
  const [tagsInput, setTagsInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setRatingValue(3);
    setReviewComment("");
    setTagsInput("");
    setTags([]);
    setDialogOpen(false);
  };

  const handleTagDelete = (id: number) => {
    setTags(tags.filter((_, idx) => idx !== id));
  };

  const buyBook = () => {
    window.open(selectedBook.buyLink, "_blank");
  };

  const postReviewComment = async () => {
    // post to backend
    const postData = {
      comment: reviewComment,
      rating: ratingValue,
      readingStatus: readingStatus,
      readPages: readPages,
      startReadAt: startReadAt,
      finishReadAt: finishReadAt,
      tags: tags.join(","),
      userEmail: user?.email,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      bookThumbnailLink: selectedBook.thumbnailLink,
      bookPublishedDate: selectedBook.publishedDate,
      bookNumOfPages: selectedBook.numOfPages,
    };
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      await axios.post("http://localhost:8080/review/", postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(
        setToast({
          message: "登録しました！",
          severity: "success",
        })
      );
      navigate("/");
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
    getBooksData();
  }, [location]);

  return (
    <Stack direction="column" maxWidth="1000px" margin="0 auto">
      <Title title="検索結果" />
      <Grid container spacing={2} marginTop="1rem">
        {books.map((book) => {
          return (
            <Grid item key={book.id} xs={12} sm={6}>
              <BookCard
                title={book.title}
                author={book.author}
                thumbnailLink={book.thumbnailLink}
                publishedDate={book.publishedDate}
                numOfPages={book.numOfPages}
                isForSale={book.isForSale}
                buyLink={book.buyLink}
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
              src={selectedBook.thumbnailLink}
              alt={selectedBook.title}
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
                {selectedBook.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`著者: ${selectedBook.author}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`出版日: ${selectedBook.publishedDate}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`ページ数: ${selectedBook.numOfPages}`}
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
                  value={readingStatus}
                  label="ステータス"
                  onChange={(event) => {
                    setReadingStatus(event.target.value as Status);
                  }}
                >
                  <MenuItem value={Status.Reading}>{Status.Reading}</MenuItem>
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
                  value={readPages}
                  onChange={(event) => {
                    setReadPages(Number(event.target.value));
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
                    value={startReadAt}
                    onChange={(event) => {
                      setStartReadAt(event.target.value);
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {"読み終わった日"}
                  </Typography>
                  <TextField
                    type="date"
                    value={finishReadAt}
                    onChange={(event) => {
                      setFinishReadAt(event.target.value);
                    }}
                  />
                </Box>
              </Stack>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {"評価"}
                </Typography>
                <Rating
                  name="half-rating"
                  size="medium"
                  value={ratingValue}
                  precision={0.5}
                  onChange={(event, newValue) => {
                    setRatingValue(newValue!);
                  }}
                />
              </Box>

              <TextField
                label="コメント"
                multiline
                rows={4}
                value={reviewComment}
                required
                onChange={(event) => {
                  setReviewComment(event.target.value);
                }}
              />

              <Stack direction="row" spacing={1}>
                <InputBase
                  placeholder="タグを入力"
                  inputProps={{ "aria-label": "add tag" }}
                  name="q"
                  sx={{
                    ml: 1,
                    // flex: 1,
                    // width: { xs: "120px", sm: "240px" },
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

        <DialogActions sx={{ justifyContent: "space-between", paddingX: 0 }}>
          {selectedBook.isForSale ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Shop />}
                onClick={buyBook}
                sx={{
                  display: { md: "flex", xs: "none" },
                  textTransform: "none",
                }}
              >
                {"購入する"}
              </Button>
              <Tooltip title="購入する">
                <IconButton
                  onClick={buyBook}
                  color="primary"
                  sx={{
                    display: { md: "none" },
                    width: "35px",
                    height: "35px",
                  }}
                >
                  <Shop />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Box></Box>
          )}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              sx={{ textTransform: "none" }}
            >
              {"戻る"}
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={postReviewComment}
              sx={{ textTransform: "none" }}
            >
              {"登録"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default SearchResult;
