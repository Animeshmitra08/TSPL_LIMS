import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Card } from 'react-native-paper';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleSubmit = () => {
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Card.Title title="Login" titleStyle={styles.title} />
        <Card.Content>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            right={
              <TextInput.Icon
                icon={secureText ? 'eye' : 'eye-off'}
                onPress={() => setSecureText(!secureText)}
              />
            }
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!username || !password}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            Login
          </Button>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f0f4f8',
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});