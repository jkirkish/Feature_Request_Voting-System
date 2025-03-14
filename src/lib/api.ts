import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    })
    return response.data
  },
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email/confirm', { token }),
}

export const featureApi = {
  create: (title: string, description: string) => 
    api.post('/features', { title, description }),
  
  vote: (featureId: string) => 
    api.post(`/features/${featureId}/vote`),
  
  updateStatus: (featureId: string, status: string) => 
    api.patch(`/features/${featureId}/status`, { status }),
}

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 