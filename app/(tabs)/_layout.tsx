import AlertMessage from '@/components/Cards/AlertMessage';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { ActivityIndicator, MD3DarkTheme, MD3LightTheme, PaperProvider, Text } from 'react-native-paper';
import LoginPage from '.';
import DrawerNavigator from '../(drawer)/DrawerNavigator';

export default function TabsLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');

  const { getItem, setItem } = useAsyncStorage('loggedIn');

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
    const init = async () => {
      const loggedIn = await getItem();
      setIsLoggedIn(loggedIn === 'true');
      setIsLoading(false);
    };
    init();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    await setItem('true');
    setIsLoggedIn(true);
    setIsLoading(false);
    setAlertMessage('Login Successful');
    setAlertType('success');
    setAlertVisible(true);
  };

  const handleLogout = async () => {
    await setItem('false');
    setIsLoggedIn(false);
    setAlertMessage('Logged out');
    setAlertType('info');
    setAlertVisible(true);
  };

  const handleVisible = () => {
    setAlertVisible(false);
  }

  return (
    <PaperProvider theme={theme}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
          <Text variant="titleMedium" style={{ marginTop: 10 }}>
            Loading...
          </Text>
        </View>
      ) : isLoggedIn ? (
        <DrawerNavigator onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}

      <AlertMessage
        key={alertMessage + alertVisible}
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onDismiss={() => setAlertVisible(false)}
        isLandScape={false}
        handleVisible={handleVisible}
      />
    </PaperProvider>
  );
}