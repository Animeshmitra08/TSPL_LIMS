# TSPL LIMS - Modern UI & Authentication Setup

## 🎨 What's Been Updated

### 1. Modern Login Screen
**File:** `app/Screens/ModernLoginScreen.tsx`

Beautiful, animated login page with:
- Smooth entrance animations
- Email/password fields with icons
- Password visibility toggle
- CAPTCHA security verification
- Remember me option
- Error handling
- Loading states
- Features showcase section

### 2. Enhanced Drawer Navigation
**File:** `navigation/ModernDrawerNavigator.tsx`

Professional drawer navigator with:
- Custom drawer header with logo
- Color-coded navigation items
- User profile section
- Role-based menu filtering
- Quick logout button
- Version info footer
- Smooth animations & hover effects

### 3. API Configuration
**File:** `config/apiConfig.ts`

Centralized API setup with:
- Environment variable support
- Token-based authentication
- AsyncStorage helpers
- Request timeout handling
- Error management
- Full TypeScript support

## 🚀 Getting Started

### 1. Install Dependencies (if needed)
```bash
npm install
# or
yarn install
```

### 2. Start Development Server
```bash
npx expo start
```

### 3. Test on Device
- Scan QR code with Expo Go app
- Or press `i` for iOS, `a` for Android, or `w` for web

## 🎯 Key Features

✅ **Modern UI Design**
- Clean, professional interface
- Smooth animations
- Responsive layouts
- Color-coded components

✅ **Authentication**
- CAPTCHA verification
- Remember me functionality
- Secure password handling
- User session persistence

✅ **Navigation**
- Drawer navigation system
- Role-based menu access
- Quick user profile access
- One-tap logout

✅ **Configuration**
- Environment-based settings
- Easy API URL switching
- Debug mode support
- Token management

## 📁 File Structure

```
TSPLLIMS/
├── app/
│   └── Screens/
│       ├── ModernLoginScreen.tsx    # New modern login
│       ├── LoginPage.tsx             # Original login (keep as backup)
│       └── ...other screens
├── config/
│   └── apiConfig.ts                 # New API configuration
├── navigation/
│   └── ModernDrawerNavigator.tsx    # New drawer navigator
├── context/
│   └── AuthContext.tsx              # Authentication context
├── .env                             # Environment variables
└── package.json
```

## 🔧 Configuration

### Environment Variables
Located in `.env`:

```env
EXPO_PUBLIC_BASE_URL=https://tsplindia.info/TSPLSAMPLINGQA/api
EXPO_PUBLIC_LOGIN_URL=https://tsplindia.info/itmsapi/api
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_AUTH_TOKEN_KEY=tspl_auth_token
EXPO_PUBLIC_AUTH_USER_KEY=tspl_auth_user
EXPO_PUBLIC_APP_NAME=TSPL LIMS
EXPO_PUBLIC_DEBUG=true
```

### Switch Between APIs

**Development (QA):**
```env
EXPO_PUBLIC_BASE_URL=https://tsplindia.info/TSPLSAMPLINGQA/api
EXPO_PUBLIC_LOGIN_URL=https://tsplindia.info/itmsapi/api
```

**Production:**
```env
EXPO_PUBLIC_BASE_URL=https://tsplindia.info/LIMSAPP/api
EXPO_PUBLIC_LOGIN_URL=https://tsplindia.info/TSPL_ITMS/api
```

## 🎨 Customization

### Change Colors
Edit the color values in:
- `ModernLoginScreen.tsx`: `styles` object
- `ModernDrawerNavigator.tsx`: `drawerItems` array for item colors

**Main Colors:**
- Primary: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)
- Warning: `#f59e0b` (Amber)

### Add New Navigation Items
Edit `navigation/ModernDrawerNavigator.tsx`:

```typescript
const drawerItems: DrawerItem[] = [
  {
    name: 'YourScreen',
    label: 'Your Label',
    icon: 'icon-name',  // From Feather Icons
    color: '#3b82f6',
    requiresAuth: 'permission',  // Optional
  },
  // ... more items
];
```

### Modify Login Screen
Edit `app/Screens/ModernLoginScreen.tsx`:
- Change logo image
- Update company name
- Customize colors
- Adjust layout spacing

## 🔐 Authentication Flow

1. User navigates to login
2. Enters email, password, and CAPTCHA
3. Clicks "Sign In"
4. AuthContext handles login (via API or mock)
5. Token stored in AsyncStorage
6. User redirected to dashboard/drawer navigation
7. Drawer shows role-based menu items
8. User can logout from drawer

## 📱 Responsive Design

The UI is fully responsive:
- **Tablet:** Larger text, optimized spacing
- **Phone:** Compact layout, touch-friendly buttons
- **Web (Expo):** Desktop-optimized experience

## 🛠️ API Integration

### Current Setup
- Mock authentication enabled
- Local development mode
- Debug logging active

### To Connect Real API:
1. Update `.env` with API URLs
2. Implement login endpoint in `AuthContext`
3. Update token handling
4. Test authentication flow

### API Call Examples

```typescript
import { apiGet, apiPost } from '@/config/apiConfig';

// GET request
const data = await apiGet('/endpoint');

// POST request
const response = await apiPost('/endpoint', {
  field: 'value'
});
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Check `.env` API URL |
| CAPTCHA error | Verify `generateCapture` function |
| Navigation stuck | Restart Expo server |
| Drawer not showing | Check navigation setup |
| Token not persisting | Verify AsyncStorage permissions |

## 📚 Related Files

- **Modern Login:** `app/Screens/ModernLoginScreen.tsx`
- **Drawer Navigator:** `navigation/ModernDrawerNavigator.tsx`
- **API Config:** `config/apiConfig.ts`
- **Auth Context:** `context/AuthContext.tsx`
- **Environment:** `.env`, `.env.local`

## ✨ Best Practices

1. **Always use `apiConfig` helpers** instead of raw fetch
2. **Store sensitive data** in AsyncStorage (not state)
3. **Clear tokens on logout** to prevent security issues
4. **Test authentication flows** on real device
5. **Keep `.env` file** in `.gitignore` (don't commit secrets)

## 🚀 Next Steps

1. Integrate with real API endpoints
2. Implement token refresh logic
3. Add error boundary components
4. Create custom hooks for common operations
5. Add offline support with Redux
6. Implement analytics tracking

---

For detailed API setup, see [API_SETUP_MOBILE.md](./API_SETUP_MOBILE.md)

For configuration details, see [.env guide](./.env)
