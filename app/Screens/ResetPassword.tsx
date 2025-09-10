import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput, IconButton } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface ResetPasswordPageProps {
  username: string;
  onComplete: () => void;
  onResetConfirm: (username: string, oldPassword: string, newPassword: string) => void;
}

export default function ResetPasswordPage({ username, onComplete, onResetConfirm }: ResetPasswordPageProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleReset = async () => {
    if (!oldPassword) {
      setError("Please enter your old password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(""); // Clear any previous errors
    onResetConfirm(username, oldPassword, newPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust for header height
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.headerContainer}>
                <IconButton
                  icon="arrow-left"
                  size={24}
                  onPress={onComplete}
                  style={styles.backButton}
                />
                <MaterialIcons name="lock-reset" size={40} color="#111b72" />
              </View>
              
              <Text style={styles.title}>Reset Password</Text>

              <Text style={styles.subtitle}>
                Resetting password for: <Text style={styles.username}>{username}</Text>
              </Text>

              <TextInput
                label="Old Password"
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showOldPassword ? "eye-off" : "eye"}
                    onPress={() => setShowOldPassword(!showOldPassword)}
                  />
                }
              />
              <TextInput
                label="New Password"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="lock-plus" />}
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? "eye-off" : "eye"}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
              />
              <TextInput
                label="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button 
                mode="contained" 
                onPress={handleReset} 
                style={styles.button}
                icon="check"
                contentStyle={styles.buttonContent}
              >
                Update Password
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  scrollContainer: { 
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%"
  },
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  card: { 
    borderRadius: 16, 
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: -10,
    top: -8,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 8, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 24, 
    textAlign: "center", 
    color: "#555" 
  },
  username: { 
    fontWeight: "bold", 
    color: "#111b72" 
  },
  input: { 
    marginBottom: 16 
  },
  error: { 
    color: "red", 
    marginBottom: 16, 
    textAlign: "center",
    fontSize: 14 
  },
  button: { 
    marginTop: 10, 
    borderRadius: 10 
  },
  buttonContent: {
    height: 48,
    justifyContent: "center",
  },
});