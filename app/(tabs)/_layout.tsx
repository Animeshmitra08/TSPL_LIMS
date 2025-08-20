import AlertMessage from '@/components/Cards/AlertMessage';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { ActivityIndicator, MD3DarkTheme, MD3LightTheme, PaperProvider, Text } from 'react-native-paper';
import LoginPage from '.';
import DrawerNavigator from '../(drawer)/DrawerNavigator';
import { useAuth } from '@/context/AuthContext'; // ✅ use your AuthContext
import axios from 'axios';

export default function TabsLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');

  const { user, login, logout } = useAuth(); // ✅ comes from AuthContext
  const scheme = useColorScheme();

  const theme = {
    ...(scheme === 'dark' ? MD3DarkTheme : MD3LightTheme),
    roundness: 2,
    colors: {
      ...(scheme === 'dark' ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: '#03045e',
      secondary: '#0077b6',
      tertiary: '#00b4d8',
      quaternary: '#90e0ef',
      lightness: '#caf0f8',
    },
  };

  useEffect(() => {
    // small timeout to simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://vedantaconnect.com:8070/FacorApi/api/User/${username.toUpperCase()}`
      );

      if (res.data?.success) {
        const userData = res.data.data;

        console.log('User data:', userData);
        

        // ✅ Call AuthContext login (your decryptPassword check runs inside it)
        const success = await login(userData, password);

        if (success) {
          setAlertMessage('Login Successful');
          setAlertType('success');
        } else {
          setAlertMessage('Invalid password');
          setAlertType('error');
        }
      } else {
        setAlertMessage('User not found');
        setAlertType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAlertMessage('Error connecting to server');
      setAlertType('error');
    } finally {
      setAlertVisible(true);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAlertMessage('Logged out');
    setAlertType('info');
    setAlertVisible(true);
  };

  const handleVisible = () => setAlertVisible(false);

  return (
    <PaperProvider theme={theme}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
          <Text variant="titleMedium" style={{ marginTop: 10 }}>
            Loading...
          </Text>
        </View>
      ) : user ? (
        <DrawerNavigator onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}

      <AlertMessage
        key={alertMessage + alertVisible}
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onDismiss={handleVisible}
        isLandScape={false}
        handleVisible={handleVisible}
      />
    </PaperProvider>
  );
}