import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    toast.success('Login successful!')
  },

  register: async (name: string, email: string, password: string, alpacaApiKey: string, alpacaSecretKey: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, alpacaApiKey, alpacaSecretKey }),
    })
    return response.json()
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },

  resetPassword: async (token: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    return response.json()
  },

  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify?token=${token}`)
    return response.json()
  },
}

// Portfolio API functions
export const portfolioAPI = {
  getPortfolio: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Orders API functions
export const ordersAPI = {
  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  createOrder: async (orderData: {
    symbol: string
    qty: number
    type: 'Buy' | 'Sell'
  }) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    })
    return response.json()
  },
}

// History API functions
export const historyAPI = {
  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },
} 