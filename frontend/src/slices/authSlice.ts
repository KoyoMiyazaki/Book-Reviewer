import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import jwt_decode from "jwt-decode";

export interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: getUser(),
};

function getUser() {
  if (localStorage.getItem("jwtToken")) {
    const decodedToken = jwt_decode<{ [name: string]: string }>(
      localStorage.getItem("jwtToken")!
    );
    if (Number(decodedToken.exp) * 1000 < Date.now()) {
      localStorage.removeItem("jwtToken");
      return null;
    } else {
      return {
        name: decodedToken.name,
        email: decodedToken.email,
      };
    }
  }
  return null;
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("jwtToken");
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
