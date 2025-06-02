import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface AuthState {
  user: null | { name: string; email: string; id: string };
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return {
      user: null,
      token: token,
      loading: false,
      error: null,
    };
  }
  return {
    user: null,
    token: null,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

// Get server URL from env (Next.js style)
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Helper function to handle API calls with token refresh
const fetchWithRefresh = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // Try to refresh the token
    const refreshResponse = await fetch(
      SERVER_URL + "/user/refresh",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (refreshResponse.ok) {
      const { token } = await refreshResponse.json();
      localStorage.setItem("token", token);

      // Retry the original request with new token
      return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      // If refresh fails, clear token and throw error
      localStorage.removeItem("token");
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};

export const login = createAsyncThunk(
  "user/login",
  async (payload: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await fetch(SERVER_URL + "/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (
    payload: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await fetch(SERVER_URL + "/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      localStorage.setItem("token", data.token);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const getUser = createAsyncThunk(
  "user/getUser",
  async (_, thunkAPI: any) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) throw new Error("No token available");

      const res = await fetchWithRefresh(SERVER_URL + "/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch user data");
      return data;
    } catch (err: any) {
      if (err.message === "Session expired. Please login again.") {
        window.location.href = "/login";
      }
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(SERVER_URL + "/user/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      localStorage.removeItem("token");
      return null;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
