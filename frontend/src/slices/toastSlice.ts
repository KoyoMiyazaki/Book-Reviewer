import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AlertColor } from "@mui/material";

interface ToastState {
  isOpen: boolean;
  message: string;
  severity: AlertColor;
}

const initialState: ToastState = {
  isOpen: false,
  message: "",
  severity: "success",
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast: (
      state,
      action: PayloadAction<{ message: string; severity: AlertColor }>
    ) => {
      state.message = action.payload.message;
      state.severity = action.payload.severity;
      state.isOpen = true;
    },
    closeToast: (state) => {
      state.isOpen = false;
    },
  },
});

export const { setToast, closeToast } = toastSlice.actions;

export default toastSlice.reducer;
