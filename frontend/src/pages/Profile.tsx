import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { Twitter } from "@mui/icons-material";
import axios, { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import Title from "../components/Title";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { setToast } from "../slices/toastSlice";
import { logout } from "../slices/authSlice";

const Profile = () => {
  const nowDate = new Date();
  const thisYear = nowDate.getFullYear();
  const thisMonth = nowDate.getMonth() + 1;
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState({
    numOfReadBooksOfMonth: 0,
    numOfReadPagesOfMonth: 0,
    numOfReadBooksOfYear: 0,
    numOfReadPagesOfYear: 0,
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const tweetStats = () => {
    const tweetContent = `
      ${thisMonth}月の読んだ書籍数: ${stats.numOfReadBooksOfMonth}
      ${thisMonth}月の読んだページ数: ${stats.numOfReadPagesOfMonth}
      ${thisYear}年の読んだ書籍数: ${stats.numOfReadBooksOfYear}
      ${thisYear}年の読んだページ数: ${stats.numOfReadPagesOfYear}`.replace(
      /^[\n|\s]+/gm,
      ""
    );
    const encodedTweetContent = encodeURI(tweetContent);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodedTweetContent}`;
    window.open(tweetUrl, "_blank");
  };

  const getReviewStatistics = async () => {
    try {
      const token: string | null = localStorage.getItem("jwtToken");
      const res = await axios.get(`http://localhost:8080/review/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          year: thisYear,
          month: thisMonth,
        },
      });
      const data = await res.data;
      setStats(data.data);
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
    getReviewStatistics();
  }, []);

  return (
    <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
      {/* ユーザプロファイル欄 */}
      <Title title="アカウント情報" />
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {"名前"}
        </Typography>
        <Input value={user?.name} readOnly sx={{ width: "100%" }} />
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {"メールアドレス"}
        </Typography>
        <Input value={user?.email} readOnly sx={{ width: "100%" }} />
      </Box>
      <Button
        variant="outlined"
        component={Link}
        to="/profile-manager"
        sx={{ textTransform: "none" }}
      >
        {"アカウントを編集"}
      </Button>

      {/* 統計情報欄 */}
      <Title title="統計情報" />
      <TableContainer component={Paper}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableBody>
            {/* 今月の統計情報 */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {`${thisMonth}月の読んだ書籍数`}
              </TableCell>
              <TableCell align="right">{stats.numOfReadBooksOfMonth}</TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {`${thisMonth}月の読んだページ数`}
              </TableCell>
              <TableCell align="right">{stats.numOfReadPagesOfMonth}</TableCell>
            </TableRow>
            {/* 今年の統計情報 */}
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {`${thisYear}年の読んだ書籍数`}
              </TableCell>
              <TableCell align="right">{stats.numOfReadBooksOfYear}</TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {`${thisYear}年の読んだページ数`}
              </TableCell>
              <TableCell align="right">{stats.numOfReadPagesOfYear}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        startIcon={<Twitter />}
        onClick={tweetStats}
        sx={{
          // display: { md: "flex", xs: "none" },
          backgroundColor: "#1d9bf0",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#0c7abf",
          },
        }}
      >
        {"統計情報をツイート"}
      </Button>
    </Stack>
  );
};

export default Profile;
