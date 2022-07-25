import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import BookCard from "../components/BookCard";
import { Grid, Stack } from "@mui/material";
import Title from "../components/Title";

const SearchResult = () => {
  const [books, setBooks] = useState<any[]>([]);
  const { search } = useLocation();
  const searchWord = search.split("=")[1];
  const location = useLocation();

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
                thumbnailLink={
                  bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : ""
                }
                author={bookInfo.authors.join(", ")}
                publishedDate={bookInfo.publishedDate}
              />
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};

export default SearchResult;
