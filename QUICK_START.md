# TSPL LIMS - Quick Start Guide

## 🚀 In 30 Seconds

### Installation
```bash
cd "c:\My Projects\React\TSPLLIMS"
npm install
npx expo start
```

### Run on Device
- **iOS:** Press `i`
- **Android:** Press `a`
- **Web:** Press `w`

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/Screens/ModernLoginScreen.tsx` | 🎨 Beautiful login page |
| `navigation/ModernDrawerNavigator.tsx` | 🎭 Navigation drawer |
| `config/apiConfig.ts` | 🔌 API configuration |
| `context/AuthContext.tsx` | 🔐 Authentication |
| `.env` | ⚙️ Environment variables |

## 📝 Common Tasks

### Change API URL
Edit `.env`:
```env
EXPO_PUBLIC_BASE_URL=https://your-api.com/api
```

### Change App Name
Edit `ModernLoginScreen.tsx`:
```typescript
<Text style={styles.companyName}>Your App Name</Text>
```

### Change Logo
Edit both files:
- `ModernLoginScreen.tsx`
- `ModernDrawerNavigator.tsx`

Replace image import:
```typescript
source={require('@/assets/images/your-logo.png')}
```

### Make API Call
```typescript
import { apiGet, apiPost } from '@/config/apiConfig';

// GET
const data = await apiGet('/endpoint');

// POST
const result = await apiPost('/endpoint', { field: 'value' });
```

### Access User Data
```typescript
import { useAuth } from '@/context/AuthContext';

const { user, login, logout, loading } = useAuth();

console.log(user?.fullname);
console.log(user?.userAuthorizations);
```

## 🎨 Colors

- 🔵 Primary: `#3b82f6`
- 🟢 Success: `#10b981`
- 🔴 Danger: `#ef4444`
- 🟠 Warning: `#f59e0b`
- ⚫ Dark: `#111827`
- ⚪ Light: `#f9fafb`

## 📚 Documentation

- **Setup:** [MODERN_UI_SETUP.md](./MODERN_UI_SETUP.md)
- **API:** [API_SETUP_MOBILE.md](./API_SETUP_MOBILE.md)
- **Upgrade:** [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md)
- **Summary:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## 🔧 Environment Variables

```env
# API
EXPO_PUBLIC_BASE_URL=https://api.example.com
EXPO_PUBLIC_LOGIN_URL=https://login.example.com
EXPO_PUBLIC_API_TIMEOUT=30000

# App
EXPO_PUBLIC_APP_NAME=TSPL LIMS
EXPO_PUBLIC_APP_VERSION=1.0.0

# Storage
EXPO_PUBLIC_AUTH_TOKEN_KEY=tspl_auth_token
EXPO_PUBLIC_AUTH_USER_KEY=tspl_auth_user

# Debug
EXPO_PUBLIC_DEBUG=true
```

## 🎯 Quick Commands

```bash
# Start dev server
npx expo start

# Install dependencies
npm install

# Lint code
npm run lint

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build web
npx expo start --web
```

## 🐛 Debug Mode

Enable in `.env`:
```env
EXPO_PUBLIC_DEBUG=true
```

View logs:
```bash
npx expo start
# Press 'j' in terminal to view logs
```

## 📱 Device Testing

### iOS Simulator
```bash
npx expo run:ios
```

### Android Emulator
```bash
npx expo run:android
```

### Physical Device (Expo Go)
1. Install Expo Go app
2. Run `npx expo start`
3. Scan QR code

## 🔐 Security Checklist

- ✅ CAPTCHA on login
- ✅ Token stored securely
- ✅ Passwords hidden
- ✅ HTTPS for API calls
- ✅ Token refresh on 401
- ✅ Clear session on logout

## 🆘 Common Issues

### App crashes on startup
```bash
# Clear cache and rebuild
rm -rf node_modules .expo
npm install
npx expo start --clear
```

### API calls failing
1. Check `.env` URLs
2. Verify backend is running
3. Test with Postman
4. Check network connectivity

### Login not working
1. Verify CAPTCHA works
2. Check API endpoint
3. Test credentials
4. Review error logs

### Drawer won't open
1. Ensure gesture handler installed
2. Restart dev server
3. Clear app cache
4. Rebuild on device

## 📊 Project Stats

- **Language:** TypeScript
- **Framework:** React Native
- **Navigation:** Expo Router + React Navigation
- **UI:** React Native Paper
- **Icons:** Feather Icons
- **Storage:** AsyncStorage
- **State:** React Context

## 💡 Tips & Tricks

1. **Fast refresh:** Edit file, press `r` in terminal
2. **Clear state:** Press `c` in terminal
3. **Restart app:** Press `Shift + R`
4. **Open DevTools:** Press `d`
5. **View logs:** Press `j`

## 🎓 Learning Path

1. Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
2. Review [ModernLoginScreen.tsx](./app/Screens/ModernLoginScreen.tsx)
3. Study [ModernDrawerNavigator.tsx](./navigation/ModernDrawerNavigator.tsx)
4. Explore [apiConfig.ts](./config/apiConfig.ts)
5. Integrate real API in `AuthContext.tsx`

## 🚀 Next Steps

- [ ] Test login flow
- [ ] Verify navigation works
- [ ] Connect to real API
- [ ] Test on real device
- [ ] Add more screens
- [ ] Implement features
- [ ] Deploy to stores

## 📞 Quick Reference

| Need | File |
|------|------|
| Login design | `ModernLoginScreen.tsx` |
| Navigation | `ModernDrawerNavigator.tsx` |
| API calls | `apiConfig.ts` |
| Auth logic | `AuthContext.tsx` |
| App config | `.env` |
| Setup help | `MODERN_UI_SETUP.md` |
| API help | `API_SETUP_MOBILE.md` |

## ⚡ Performance Tips

1. Use `React.memo` for components
2. Debounce API calls
3. Lazy load images
4. Use FlatList for lists
5. Cache API responses

## 🎨 Customization Quick Links

- Colors: Search `#3b82f6` in files
- Fonts: Update `expo-font` imports
- Icons: Change Feather icon names
- Spacing: Adjust stylesheet values
- Animations: Modify `Animated` properties

---

**Need Help?**
1. Check documentation files
2. Review code comments
3. Check error messages
4. Search in codebase
5. Test with Postman

**Ready to Start?** → Run `npx expo start` 🎉
