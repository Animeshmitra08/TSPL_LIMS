import { generateCapture } from '@/constants/generateCapture';
import Feather from '@expo/vector-icons/Feather';
import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput, Snackbar } from 'react-native-paper';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  onResetPassword: (username: string) => void;
}

export default function LoginPage({ onLogin, onResetPassword }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // capture verification
  const previous = useRef("");
  // replace your captcha state
  const [captureVerification, setCaptureVerification] = useState<{
    code: string;        // raw value
    display: string;     // styled version
    clientCode: string;
  }>({
    ...(() => {
      const cap = generateCapture();
      return { code: cap.raw, display: cap.styled, clientCode: "" };
    })(),
  });
  
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'info' | 'error' | 'success'>('info');

  const showMessage = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleSubmit = () => {
    // Captcha validation
    if (!captureVerification.clientCode) {
      showMessage("Please enter security code", "error");
      return;
    }
    if (captureVerification.clientCode !== captureVerification.code) {
      showMessage("Incorrect security code", "error");
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      onLogin(username, password);
    } catch (error) {
      showMessage("Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshCaptcha = () => {
    const cap = generateCapture(captureVerification.code);
    setCaptureVerification({
      code: cap.raw,
      display: cap.styled,
      clientCode: "",
    });
  };

  const getSnackbarStyle = () => {
    switch (snackbarType) {
      case 'error':
        return { backgroundColor: '#d32f2f' };
      case 'success':
        return { backgroundColor: '#2e7d32' };
      default:
        return { backgroundColor: '#1976d2' };
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('@/assets/images/tspl-logo.jpeg')} 
            style={styles.logo} 
          />
          <Text variant="headlineSmall" style={styles.companyName}>
            Talwandi Sabo Power Ltd
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Please login to continue
          </Text>
        </View>

        {/* Form Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Username Input */}
            <TextInput
              mode="outlined"
              label="Username"
              value={username}
              onChangeText={setUsername}
              left={<TextInput.Icon icon="account" />}
              style={styles.input}
            />

            {/* Password Input */}
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            {/* Captcha Section */}
            <View style={styles.captchaContainer}>
              <Text variant="bodyMedium" style={styles.captchaLabel}>
                Security Code
              </Text>
              
              <View style={styles.captchaDisplay}>
                <Text style={styles.captchaCode}>
                  {captureVerification.display}
                </Text>
                <Pressable onPress={refreshCaptcha} style={styles.refreshButton}>
                  <Feather name="rotate-ccw" size={20} color="#6750a4" />
                </Pressable>
              </View>

              <TextInput
                mode="outlined"
                label="Enter Security Code"
                value={captureVerification.clientCode}
                onChangeText={(text) => {
                  setCaptureVerification({
                    ...captureVerification, // keep code + display
                    clientCode: text,
                  });
                }}
                left={<TextInput.Icon icon="shield-check" />}
                style={styles.input}
              />
            </View>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={!username || !password || loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              Login
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={[styles.snackbar, getSnackbarStyle()]}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
          textColor: 'white'
        }}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  companyName: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  captchaContainer: {
    marginBottom: 24,
  },
  captchaLabel: {
    marginBottom: 12,
    fontWeight: '500',
    color: '#333',
  },
  captchaDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  captchaCode: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  refreshButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  topSnackbar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 8,
  },
  snackbarText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  snackbar: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 8,
  },
});