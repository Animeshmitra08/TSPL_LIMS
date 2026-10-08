import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Button, TextInput, Text, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { generateCapture } from '@/constants/generateCapture';
import Feather from '@expo/vector-icons/Feather';

const { width } = Dimensions.get('window');

export default function ModernLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();

  // Captcha verification
  const [captureVerification, setCaptureVerification] = useState<{
    code: string;
    display: string;
    clientCode: string;
  }>({
    ...(() => {
      const cap = generateCapture();
      return { code: cap.raw, display: cap.styled, clientCode: '' };
    })(),
  });

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!captureVerification.clientCode) {
      setError('Please enter security code');
      return;
    }

    if (captureVerification.clientCode !== captureVerification.code) {
      setError('Incorrect security code');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API login
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshCaptcha = () => {
    const cap = generateCapture(captureVerification.code);
    setCaptureVerification({
      code: cap.raw,
      display: cap.styled,
      clientCode: '',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/tspl-logo.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.companyName}>TSPL LIMS</Text>
            <Text style={styles.subtitle}>Laboratory Information Management System</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to your account</Text>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#d1d5db"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  keyboardType="email-address"
                  mode="flat"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#d1d5db"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  mode="flat"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* Captcha */}
            <View style={styles.captchaSection}>
              <Text style={styles.label}>Security Code</Text>
              <View style={styles.captchaContainer}>
                <View style={styles.captchaDisplay}>
                  <Text style={styles.captchaText}>{captureVerification.display}</Text>
                </View>
                <Pressable onPress={refreshCaptcha} style={styles.refreshButton}>
                  <Feather name="refresh-cw" size={20} color="#3b82f6" />
                </Pressable>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter code"
                  placeholderTextColor="#d1d5db"
                  value={captureVerification.clientCode}
                  onChangeText={(text) =>
                    setCaptureVerification({
                      ...captureVerification,
                      clientCode: text,
                    })
                  }
                  editable={!loading}
                  mode="flat"
                />
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.footerOptions}>
              <Pressable
                style={styles.rememberCheck}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Feather name="check" size={14} color="white" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              labelStyle={styles.loginButtonLabel}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Pressable>
                <Text style={styles.signupLink}>Sign up</Text>
              </Pressable>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>✓</Text>
              </View>
              <Text style={styles.featureText}>Secure & Encrypted</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>✓</Text>
              </View>
              <Text style={styles.featureText}>Real-time Updates</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>✓</Text>
              </View>
              <Text style={styles.featureText}>24/7 Support</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    gap: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 64,
    height: 64,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#111827',
  },
  eyeIcon: {
    padding: 8,
  },
  captchaSection: {
    marginBottom: 16,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  captchaDisplay: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captchaText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 2,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  rememberText: {
    fontSize: 13,
    color: '#4b5563',
  },
  forgotLink: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  loginButton: {
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginBottom: 12,
  },
  loginButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 13,
    color: '#4b5563',
  },
  signupLink: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  featuresSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 50,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#3b82f6',
  },
  featureText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
});
