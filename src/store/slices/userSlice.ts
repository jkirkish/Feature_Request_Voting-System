import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string | null
  email: string | null
}

interface UserState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
  },
})

export const { setUser, setLoading, setError, logout } = userSlice.actions

export default userSlice.reducer 