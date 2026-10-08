# TSPL LIMS - Mobile API Integration Guide

## Overview
This guide explains how to integrate real APIs with the TSPL LIMS mobile application.

## Current Setup

### Environment Configuration
Located in `.env`:
```env
EXPO_PUBLIC_BASE_URL=https://tsplindia.info/TSPLSAMPLINGQA/api
EXPO_PUBLIC_LOGIN_URL=https://tsplindia.info/itmsapi/api
EXPO_PUBLIC_API_TIMEOUT=30000
```

### API Helper Functions
Located in `config/apiConfig.ts`:
- `apiGet()` - GET requests
- `apiPost()` - POST requests
- `apiPut()` - PUT requests
- `apiDelete()` - DELETE requests
- `storage` - Token/User management

## Making API Calls

### Basic Examples

```typescript
import { apiGet, apiPost, storage } from '@/config/apiConfig';

// GET request
const users = await apiGet('/users');

// POST request
const result = await apiPost('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Accessing token
const token = await storage.getToken();

// Storing user
await storage.setUser(userData);
```

## Authentication Flow

### 1. Login Endpoint
**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "captcha": "ABCD1234"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "userid": "123",
    "fullname": "John Doe",
    "emailid": "john@example.com",
    "rolE_NM": "Operator",
    "userAuthorizations": [
      {
        "path": "coalSampling",
        "menuname": "Coal Sampling",
        "menulevel": "1"
      }
    ]
  }
}
```

### 2. Token Storage
Tokens are automatically stored in AsyncStorage:
```typescript
// After successful login
await storage.setToken(response.token);
await storage.setUser(response.user);
```

### 3. Token Inclusion
All API requests automatically include the token:
```
Authorization: Bearer <token>
```

### 4. Token Refresh
When token expires (401 response):
```typescript
// Implement in AuthContext or middleware
const newToken = await apiPost('/auth/refresh');
await storage.setToken(newToken.token);
// Retry original request
```

## Coal Sampling API

### Get All Samples
**GET** `/coalsampling`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status

**Response:**
```json
{
  "data": [
    {
      "sampleId": "CS001",
      "vehicleNumber": "ABC123",
      "samplingDate": "2024-09-05",
      "status": "pending",
      "location": "Coal Yard"
    }
  ],
  "total": 100,
  "page": 1
}
```

### Create Sample
**POST** `/coalsampling/create`

**Request:**
```json
{
  "vehicleNumber": "ABC123",
  "samplingDate": "2024-09-05",
  "location": "Coal Yard",
  "quantity": 1000,
  "remarks": "Sample collected"
}
```

### Update Sample
**PUT** `/coalsampling/{id}`

**Request:**
```json
{
  "status": "completed",
  "remarks": "Updated remarks"
}
```

## Biomass Sampling API

### Get All Samples
**GET** `/biomasssampling`

**Response Format:** Same as coal sampling

### Create Sample
**POST** `/biomasssampling/create`

**Request:**
```json
{
  "vehicleNumber": "XYZ789",
  "samplingDate": "2024-09-05",
  "biomassType": "Rice Husk",
  "quantity": 500,
  "location": "Biomass Storage"
}
```

## Vehicle Status API

### Get Vehicle Status
**GET** `/vehiclestatus`

**Response:**
```json
{
  "data": [
    {
      "vehicleId": "VH001",
      "vehicleNumber": "ABC123",
      "status": "In Transit",
      "currentLocation": "Coal Yard",
      "driver": "John Doe",
      "lastUpdate": "2024-09-05T10:30:00"
    }
  ]
}
```

### Get Vehicle Details
**GET** `/vehicledetails/{vehicleNumber}`

**Response:**
```json
{
  "vehicleNumber": "ABC123",
  "vehicleType": "Truck",
  "capacity": 20000,
  "owner": "TSPL",
  "registrationDate": "2023-01-15",
  "insuranceValidity": "2025-01-15"
}
```

## Error Handling

### API Errors
All API calls throw errors on failure:

```typescript
try {
  const data = await apiGet('/endpoint');
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    // Handle error
  }
}
```

### Common Error Codes
| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Refresh token or login again |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Verify endpoint URL |
| 500 | Server Error | Retry or contact support |

### In React Components

```typescript
import { useCallback, useState } from 'react';
import { apiGet } from '@/config/apiConfig';

function MyComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet('/endpoint');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    // Component JSX
  );
}
```

## Authentication Context

Located in `context/AuthContext.tsx`:

```typescript
const { user, login, logout, loading } = useAuth();

// Login
await login(email, password);

// Logout
await logout();

// Check authentication
if (user) {
  // User is authenticated
}
```

## Real API Integration Checklist

- [ ] Update `.env` with production API URLs
- [ ] Implement login endpoint in AuthContext
- [ ] Add token refresh logic
- [ ] Test all CRUD operations
- [ ] Implement error boundary
- [ ] Add loading spinners
- [ ] Test offline functionality
- [ ] Verify token persistence
- [ ] Test logout flow
- [ ] Monitor API performance

## Performance Tips

1. **Cache API responses** using AsyncStorage
2. **Implement request debouncing** for search
3. **Use pagination** for large datasets
4. **Add loading states** for UX
5. **Handle offline scenarios** gracefully

## Security Best Practices

1. **Never log tokens** to console
2. **Use HTTPS** for all API calls
3. **Validate input** before sending
4. **Clear tokens on logout** immediately
5. **Implement token expiration** checks
6. **Use secure storage** for sensitive data

## Testing API Integration

### Using Postman
1. Import API endpoints
2. Test with sample data
3. Verify response formats
4. Check error handling

### Using React Native Debugger
1. Monitor network requests
2. Check request/response headers
3. Verify token inclusion
4. Debug API errors

### Unit Testing
```typescript
import { render, waitFor } from '@testing-library/react-native';
import MyComponent from './MyComponent';

describe('API Integration', () => {
  it('should fetch data on mount', async () => {
    const { getByText } = render(<MyComponent />);
    
    await waitFor(() => {
      expect(getByText('Expected Text')).toBeVisible();
    });
  });
});
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS Error | API doesn't allow requests | Configure CORS on backend |
| Token not sent | Storage not initialized | Check AsyncStorage permissions |
| 401 Unauthorized | Invalid/expired token | Implement token refresh |
| Network timeout | Slow connection | Increase timeout value |
| Blank response | Missing response body | Check endpoint returns JSON |

## API Documentation Links

- **Login API:** `POST /auth/login`
- **Coal Sampling:** `GET/POST /coalsampling`
- **Biomass Sampling:** `GET/POST /biomasssampling`
- **Vehicle Status:** `GET /vehiclestatus`
- **Reports:** `GET /reports`

---

For UI setup details, see [MODERN_UI_SETUP.md](./MODERN_UI_SETUP.md)

For configuration details, see [.env guide](./.env)
