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
    const url = `${API_BASE_URL}/auth/login`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    toast.success('Login successful!')
  },

  register: async (name: string, email: string, password: string, alpacaApiKey: string, alpacaSecretKey: string) => {
    const url = `${API_BASE_URL}/auth/register`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, alpacaApiKey, alpacaSecretKey }),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  forgotPassword: async (email: string) => {
    const url = `${API_BASE_URL}/auth/forgot-password`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  resetPassword: async (token: string, password: string) => {
    const url = `${API_BASE_URL}/auth/reset-password`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  verifyEmail: async (token: string) => {
    const url = `${API_BASE_URL}/auth/verify?token=${token}`;
    console.log('API Request', { url });
    let response;
    try {
      response = await fetch(url);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
}

// Portfolio API functions
export const portfolioAPI = {
  getPortfolio: async () => {
    const url = `${API_BASE_URL}/portfolio`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
  getPositions: async () => {
    const url = `${API_BASE_URL}/portfolio/positions`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
  getPortfolioHistory: async (params?: { period?: string; timeframe?: string }) => {
    const url = new URL(`${API_BASE_URL}/portfolio/history`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url: url.toString(), options });
    let response;
    try {
      response = await fetch(url.toString(), options);
      console.log('API Response', { url: url.toString(), status: response.status });
    } catch (err) {
      console.error('API Error', { url: url.toString(), err });
      throw err;
    }
    return response.json();
  },
}

// Orders API functions
export const ordersAPI = {
  getOrders: async () => {
    const url = `${API_BASE_URL}/orders`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  createOrder: async (orderData: {
    symbol: string
    qty: number
    side: 'buy' | 'sell'
    type: 'market' | 'limit' | 'stop' | 'stop_limit'
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok'
  }) => {
    const url = `${API_BASE_URL}/orders`;
    const options = {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  cancelOrder: async (orderId: string) => {
    const url = `${API_BASE_URL}/orders/${orderId}`;
    const options = {
      method: 'DELETE',
      headers: getAuthHeaders(),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
}

// History API functions
export const historyAPI = {
  getHistory: async () => {
    const url = `${API_BASE_URL}/history`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
  getTradeHistory: async (params?: { activity_type?: string; start?: string; end?: string }) => {
    const url = new URL(`${API_BASE_URL}/history/activities`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url: url.toString(), options });
    let response;
    try {
      response = await fetch(url.toString(), options);
      console.log('API Response', { url: url.toString(), status: response.status });
    } catch (err) {
      console.error('API Error', { url: url.toString(), err });
      throw err;
    }
    return response.json();
  },
}

export const marketAPI = {
  getQuote: async (symbol: string) => {
    const url = `${API_BASE_URL}/portfolio/market/quote/${symbol}`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    if (response.status === 403) {
      const data = await response.json();
      throw new Error(data.error || 'Alpaca API access forbidden. Please check your API keys and permissions.');
    }
    return response.json();
  },
  getBars: async (symbol: string, params?: { timeframe?: string; start?: string; end?: string; limit?: string }) => {
    const url = new URL(`${API_BASE_URL}/portfolio/market/bars/${symbol}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url: url.toString(), options });
    let response;
    try {
      response = await fetch(url.toString(), options);
      console.log('API Response', { url: url.toString(), status: response.status });
    } catch (err) {
      console.error('API Error', { url: url.toString(), err });
      throw err;
    }
    return response.json();
  },
  getSymbols: async () => {
    const url = `${API_BASE_URL}/portfolio/market/symbols`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    if (!response.ok) throw new Error('Failed to fetch symbols');
    return response.json();
  },
}

// News API functions
export const newsAPI = {
  getNews: async (symbol: string) => {
    const url = `${API_BASE_URL}/news/${symbol}`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
}

export const accountAPI = {
  updateAlpacaKeys: async (alpacaPaperApiKey: string, alpacaPaperSecretKey: string, alpacaLiveApiKey: string, alpacaLiveSecretKey: string, alpacaEnv: 'paper' | 'live') => {
    const url = `${API_BASE_URL}/auth/alpaca-keys`;
    const options = {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ alpacaPaperApiKey, alpacaPaperSecretKey, alpacaLiveApiKey, alpacaLiveSecretKey, alpacaEnv }),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
  removeAlpacaKeys: async () => {
    const url = `${API_BASE_URL}/auth/alpaca-keys`;
    const options = {
      method: 'DELETE',
      headers: getAuthHeaders(),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
}

export const notificationsAPI = {
  list: async () => {
    const url = `${API_BASE_URL}/notifications`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
  markAsRead: async (id: number) => {
    const url = `${API_BASE_URL}/notifications/${id}/read`;
    const options = {
      method: 'PATCH',
      headers: getAuthHeaders(),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
  delete: async (id: number) => {
    const url = `${API_BASE_URL}/notifications/${id}`;
    const options = {
      method: 'DELETE',
      headers: getAuthHeaders(),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
  poll: async () => {
    const url = `${API_BASE_URL}/notifications/poll`;
    const options = {
      method: 'POST',
      headers: getAuthHeaders(),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
};

export const backtestAPI = {
  runBacktest: async (params: { symbol: string; from: string; to: string; strategy: string; params?: any }) => {
    const url = `${API_BASE_URL}/backtest`;
    const options = {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Backtest failed');
    }
    return response.json();
  },
}

export async function runBasicMomentum(prices: number[], window: number) {
  const url = `${API_BASE_URL}/strategies/basic-momentum`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prices, window }),
  };
  console.log('API Request', { url, options });
  let response;
  try {
    response = await fetch(url, options);
    console.log('API Response', { url, status: response.status });
  } catch (err) {
    console.error('API Error', { url, err });
    throw err;
  }
  if (!response.ok) throw new Error('Failed to run Basic Momentum');
  return response.json();
}

export async function runAdvancedMomentum(priceMatrix: number[][], lookback: number, topPercent: number) {
  const url = `${API_BASE_URL}/strategies/advanced-momentum`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceMatrix, lookback, topPercent }),
  };
  console.log('API Request', { url, options });
  let response;
  try {
    response = await fetch(url, options);
    console.log('API Response', { url, status: response.status });
  } catch (err) {
    console.error('API Error', { url, err });
    throw err;
  }
  if (!response.ok) throw new Error('Failed to run Advanced Momentum');
  return response.json();
}

export async function runMeanReversionML(prices: number[], window: number, xPct: number, yDays: number, rsiThreshold: number) {
  const url = `${API_BASE_URL}/strategies/mean-reversion-ml`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prices, window, xPct, yDays, rsiThreshold }),
  };
  console.log('API Request', { url, options });
  let response;
  try {
    response = await fetch(url, options);
    console.log('API Response', { url, status: response.status });
  } catch (err) {
    console.error('API Error', { url, err });
    throw err;
  }
  if (!response.ok) throw new Error('Failed to run Mean Reversion ML');
  return response.json();
}

export async function runVolatilityBreakout(highs: number[], lows: number[], closes: number[], period: number, k: number) {
  const url = `${API_BASE_URL}/strategies/volatility-breakout`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ highs, lows, closes, period, k }),
  };
  console.log('API Request', { url, options });
  let response;
  try {
    response = await fetch(url, options);
    console.log('API Response', { url, status: response.status });
  } catch (err) {
    console.error('API Error', { url, err });
    throw err;
  }
  if (!response.ok) throw new Error('Failed to run Volatility Breakout');
  return response.json();
}

// Market Event Comparison
export async function fetchMarketEventComparison({ strategy, symbol, periodA, periodB, includeNews, token }: any) {
  const url = `${API_BASE_URL}/market-event-comparison`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ strategy, symbol, periodA, periodB, includeNews }),
  };
  console.log('API Request', { url, options });
  let response;
  try {
    response = await fetch(url, options);
    console.log('API Response', { url, status: response.status });
  } catch (err) {
    console.error('API Error', { url, err });
    throw err;
  }
  if (!response.ok) throw new Error("Failed to fetch market event comparison");
  return response.json();
}

// Order Logs
export async function fetchOrderLogs(token: string) {
  const url = `${API_BASE_URL}/order-logs`;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  console.log('API Request', { url, options });
  let response;
  try {
    response = await fetch(url, options);
    console.log('API Response', { url, status: response.status });
  } catch (err) {
    console.error('API Error', { url, err });
    throw err;
  }
  if (!response.ok) throw new Error("Failed to fetch order logs");
  return response.json();
}

// Portfolio Replay
export async function fetchPortfolioReplay({ strategy, symbol, from, to, token }: any) {
  const url = `${API_BASE_URL}/portfolio-replay`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ strategy, symbol, from, to }),
  };
  console.log('API Request', { url, options });
  let response;
  try {
    response = await fetch(url, options);
    console.log('API Response', { url, status: response.status });
  } catch (err) {
    console.error('API Error', { url, err });
    throw err;
  }
  if (!response.ok) throw new Error("Failed to fetch portfolio replay");
  return response.json();
} 

// Training API functions
export const trainingAPI = {
  getModules: async () => {
    const url = `${API_BASE_URL}/training/modules`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  getModule: async (moduleId: string) => {
    const url = `${API_BASE_URL}/training/modules/${moduleId}`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  getUnit: async (unitId: string) => {
    const url = `${API_BASE_URL}/training/units/${unitId}`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  getProgress: async () => {
    const url = `${API_BASE_URL}/training/progress`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  updateUnitProgress: async (unitId: string, progressData: {
    completed: boolean
    timeSpent: number
    tokensEarned: number
    score?: number
  }) => {
    const url = `${API_BASE_URL}/training/units/${unitId}/progress`;
    const options = {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
} 

// Gamification API functions
export const gamificationAPI = {
  getAchievements: async () => {
    const url = `${API_BASE_URL}/training/achievements`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  getBadges: async () => {
    const url = `${API_BASE_URL}/training/badges`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },

  getLeaderboard: async () => {
    const url = `${API_BASE_URL}/training/leaderboard`;
    const options = { headers: getAuthHeaders() };
    console.log('API Request', { url, options });
    let response;
    try {
      response = await fetch(url, options);
      console.log('API Response', { url, status: response.status });
    } catch (err) {
      console.error('API Error', { url, err });
      throw err;
    }
    return response.json();
  },
} 