import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, useColorScheme, View } from 'react-native';
import { ActivityIndicator, Icon, MD3DarkTheme, MD3LightTheme, PaperProvider, Snackbar, Text } from 'react-native-paper';
import LoginPage from '.';
import DrawerNavigator from '../(drawer)/DrawerNavigator';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResetPasswordPage from '../Screens/ResetPassword';
import { decrypt, encrypt } from '@/context/cryptoutils';

import NetInfo from '@react-native-community/netinfo';


const lightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#111b72ff',
      accent: '#3498db',
      secondary: '#3498db',
      surface: '#ffffff',
      text: '#34495e',
      placeholder: '#7f8c8d',
      error: '#e74c3c',
    },
    roundness: 8,
  };

  // const darkTheme = {
  //   ...MD3DarkTheme,
  //   colors: {
  //     ...MD3DarkTheme.colors,
  //     primary: '#4a6cf7',
  //     secondary: '#5dade2',
  //     accent: '#3498db',
  //     surface: '#193b86ff',
  //     text: '#fff',
  //     placeholder: '#95a5a6',
  //     error: '#e74c3c',
  //   },
  //   roundness: 8,
  // };

export default function TabsLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [resetMode, setResetMode] = useState<{ user: any } | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');

  const { user, login, logout, resetPassword } = useAuth();
  const scheme = useColorScheme();

  // const API_Base_URL = process.env.EXPO_PRIVATE_LOGIN_URL || 'https://tsplindia.info/itmsapi/api';
  const API_Base_URL = process.env.EXPO_PRIVATE_LOGIN_URL || 'https://tsplindia.info/TSPL_ITMS/api';

  useEffect(() => {
    // small timeout to simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);  


  const [visible, setVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const wasConnected = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = !!state.isConnected;

      if (wasConnected.current && !isConnected) {
        // Going offline
        setIsOffline(true);
        setVisible(true);
      } else if (!wasConnected.current && isConnected) {
        // Coming back online
        setIsOffline(false);
        setVisible(true);
        // Auto-hide the "back online" message after 3 seconds
        setTimeout(() => setVisible(false), 3000);
      }

      wasConnected.current = isConnected;
    });

    return () => unsubscribe();
  }, []);
  

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_Base_URL}/TSPL_Users/${username.toUpperCase()}`
      );

      if (res.data?.success) {
        const userData = res.data.data;        
        const decryptedPassword = decrypt(userData.password);
        

        // Check for default password BEFORE login
        if (decryptedPassword === "Tspl@#202401") {
          setResetMode({ user: userData });
          setAlertMessage('Please reset your default password');
          setAlertType('info');
          return;
        }

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
    } catch (error : any) {
      const err = error.response.data.Data.ErrorInfo;
      console.error('Login error:', err);
      setAlertMessage(`${err.Key} : ${err.Message}`);
      setAlertType('error');
    } finally {
      setAlertVisible(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!resetMode) return;

    const backAction = () => {
      setResetMode(null); // go back to LoginPage
      return true; // block default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [resetMode]);

  const handleLogout = async () => {
    await logout();
    setAlertMessage('Logged out');
    setAlertType('info');
    setAlertVisible(true);
  };

  const handleResetPassword = (username: string) => {
    if (!user) return; // fallback safety
    setResetMode({ user });
  };

  const handleResetPasswordConfirm = async (username: string, oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const encryptedPassword = encrypt(newPassword);

      const currentUser = resetMode?.user;
      if (!currentUser) throw new Error("No user Content");

      const updatedUser = {
        ...currentUser,                     
        password: encryptedPassword,
      };

      const res = await axios.post(`${API_Base_URL}/TSPL_Users/UpdateUser`, updatedUser);

      if (res.data?.success) {
        const success = await login(updatedUser, newPassword);

        if (success) {
          setAlertMessage("Password reset successful. You are now logged in.");
          setAlertType("success");
          setResetMode(null); // go to home automatically
        } else {
          setAlertMessage("Password reset successful but login failed.");
          setAlertType("error");
        }
      } else {
        setAlertMessage(res.data?.data || "Failed to reset password");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setAlertMessage("Error connecting to server");
      setAlertType("error");
    } finally {
      setAlertVisible(true);
      setIsLoading(false);
    }
  };

  const handleVisible = () => setAlertVisible(false);

  const backgroundColor = isOffline ? '#D32F2F' : '#388E3C'; // red / green shades
  const iconName = isOffline ? 'wifi-off' : 'wifi';
  const message = isOffline ? 'You are offline' : 'Back online';

  return (
    <PaperProvider theme={lightTheme}>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} size="large" />
          <Text variant="titleMedium" style={{ marginTop: 10 }}>
            Loading...
          </Text>
        </View>
      )  : resetMode ? ( 
        <ResetPasswordPage
          username={resetMode.user.emailid}
          onComplete={() => setResetMode(null)}
          onResetConfirm={handleResetPasswordConfirm}
        />
      ) : user ? (
        <DrawerNavigator onLogout={handleLogout} />
      ) : (
        <LoginPage 
          onLogin={handleLogin} 
          onResetPassword={handleResetPassword}
        />
      )}

      <Snackbar
        visible={alertVisible}
        onDismiss={handleVisible}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setAlertVisible(false),
        }}
        style={{
          backgroundColor:
            alertType === "success"
              ? "green"
              : alertType === "error"
              ? "red"
              : "#3498db",
        }}
      >
        {alertMessage}
      </Snackbar>
      <Snackbar
        visible={visible}
        onDismiss={() => {
          // Only allow dismissing when back online
          if (!isOffline) {
            setVisible(false);
          }
        }}
        duration={isOffline ? Number.POSITIVE_INFINITY : 3000}
        style={{
          backgroundColor,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon source={iconName} size={20} color="white" />
          <View style={{ width: 8 }} />
          <Text style={{ color: 'white', fontWeight: '600' }}>{message}</Text>
        </View>
      </Snackbar>
    </PaperProvider>
  );
}