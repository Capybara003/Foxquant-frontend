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
  getPositions: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/positions`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },
  getPortfolioHistory: async (params?: { period?: string; timeframe?: string }) => {
    const url = new URL(`${API_BASE_URL}/portfolio/history`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return response.json();
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
    side: 'buy' | 'sell'
    type: 'market' | 'limit' | 'stop' | 'stop_limit'
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok'
  }) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    })
    return response.json()
  },

  cancelOrder: async (orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
  getTradeHistory: async (params?: { activity_type?: string; start?: string; end?: string }) => {
    const url = new URL(`${API_BASE_URL}/history/activities`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
}

export const marketAPI = {
  getQuote: async (symbol: string) => {
    const response = await fetch(`${API_BASE_URL}/portfolio/market/quote/${symbol}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  getBars: async (symbol: string, params?: { timeframe?: string; start?: string; end?: string; limit?: string }) => {
    const url = new URL(`${API_BASE_URL}/portfolio/market/bars/${symbol}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
}

export const accountAPI = {
  updateAlpacaKeys: async (alpacaPaperApiKey: string, alpacaPaperSecretKey: string, alpacaLiveApiKey: string, alpacaLiveSecretKey: string, alpacaEnv: 'paper' | 'live') => {
    const response = await fetch(`${API_BASE_URL}/auth/alpaca-keys`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ alpacaPaperApiKey, alpacaPaperSecretKey, alpacaLiveApiKey, alpacaLiveSecretKey, alpacaEnv }),
    });
    return response.json();
  },
  removeAlpacaKeys: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/alpaca-keys`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
}

export const notificationsAPI = {
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  markAsRead: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  poll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/poll`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
}; 