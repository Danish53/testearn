import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

async function parseResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ username, email, password, referralCode }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, referralCode }),
    });
    return parseResponse(res);
  }
);

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async ({ email, otp }) => {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await parseResponse(res);
  return data.user;
});

export const resendOtp = createAsyncThunk("auth/resendOtp", async ({ email }) => {
  const res = await fetch("/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseResponse(res);
});

export const loginUser = createAsyncThunk("auth/login", async ({ email, password }) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseResponse(res);
  return data.user;
});

export const fetchSession = createAsyncThunk("auth/fetchSession", async () => {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  const data = await parseResponse(res);
  return data.user;
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    hydrated: false,
    pendingEmail: null,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setPendingEmail(state, action) {
      state.pendingEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    };

    builder
      .addCase(registerUser.pending, setPending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingEmail = action.meta.arg.email;
      })
      .addCase(registerUser.rejected, setRejected)

      .addCase(verifyOtp.pending, setPending)
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.pendingEmail = null;
      })
      .addCase(verifyOtp.rejected, setRejected)

      .addCase(resendOtp.pending, setPending)
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtp.rejected, setRejected)

      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, setRejected)

      .addCase(fetchSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
      })
      .addCase(fetchSession.rejected, (state) => {
        state.loading = false;
        state.hydrated = true;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { clearAuthError, setPendingEmail } = authSlice.actions;
export default authSlice.reducer;
