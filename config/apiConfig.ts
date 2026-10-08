import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export const apiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_BASE_URL,
  loginUrl: process.env.EXPO_PUBLIC_LOGIN_URL,
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),

  endpoints: {
    // Auth
    login: '/login',
    logout: '/logout',
    getUser: '/getuser',

    // Coal Sampling
    coalSampling: '/coalsampling',
    coalSamplingCreate: '/coalsampling/create',
    coalSamplingUpdate: '/coalsampling/update',

    // Biomass Sampling
    biomassSampling: '/biomasssampling',
    biomassSamplingCreate: '/biomasssampling/create',

    // Vehicle Status
    vehicleStatus: '/vehiclestatus',
    vehicleDetails: (id: string) => `/vehicledetails/${id}`,

    // Reports
    reports: '/reports',
    samplingData: '/samplingdata',
  },
};

// Helper function for API requests
export async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit & { baseUrl?: string } = {}
): Promise<T> {
  const baseUrl = options.baseUrl || apiConfig.baseUrl;
  delete (options as any).baseUrl;

  const url = `${baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Failed:', { endpoint, error });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// GET request helper
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: Omit<RequestInit & { baseUrl?: string }, 'method'>
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

// POST request helper
export async function apiPost<T = unknown>(
  endpoint: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestInit & { baseUrl?: string }, 'method' | 'body'>
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request helper
export async function apiPut<T = unknown>(
  endpoint: string,
  data?: Record<string, unknown>,
  options?: Omit<RequestInit & { baseUrl?: string }, 'method' | 'body'>
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request helper
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: Omit<RequestInit & { baseUrl?: string }, 'method'>
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

// Get authorization headers
function getAuthHeaders(): Record<string, string> {
  // Token is fetched synchronously from AsyncStorage in useEffect context
  // This is a placeholder - actual implementation in AuthContext
  return {};
}

// Storage helpers for authentication
export const storage = {
  setToken: async (token: string) => {
    await AsyncStorage.setItem(
      process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY || 'tspl_auth_token',
      token
    );
  },

  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(
      process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY || 'tspl_auth_token'
    );
  },

  removeToken: async () => {
    await AsyncStorage.removeItem(
      process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY || 'tspl_auth_token'
    );
  },

  setUser: async (user: Record<string, unknown>) => {
    await AsyncStorage.setItem(
      process.env.EXPO_PUBLIC_AUTH_USER_KEY || 'tspl_auth_user',
      JSON.stringify(user)
    );
  },

  getUser: async (): Promise<Record<string, unknown> | null> => {
    const user = await AsyncStorage.getItem(
      process.env.EXPO_PUBLIC_AUTH_USER_KEY || 'tspl_auth_user'
    );
    return user ? JSON.parse(user) : null;
  },

  removeUser: async () => {
    await AsyncStorage.removeItem(
      process.env.EXPO_PUBLIC_AUTH_USER_KEY || 'tspl_auth_user'
    );
  },

  clear: async () => {
    await AsyncStorage.removeItem(
      process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY || 'tspl_auth_token'
    );
    await AsyncStorage.removeItem(
      process.env.EXPO_PUBLIC_AUTH_USER_KEY || 'tspl_auth_user'
    );
  },
};

// App configuration
export const appConfig = {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'TSPL LIMS',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  debug: process.env.EXPO_PUBLIC_DEBUG === 'true',
};
