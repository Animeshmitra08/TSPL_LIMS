
import AlertMessage from '@/components/Cards/AlertMessage';
import { generateCapture } from '@/constants/generateCapture';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Card, DefaultTheme, Text, TextInput, useTheme } from 'react-native-paper';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  // capture verification
  const previous = useRef("");
  const [captureVerification, setCaptureVerification] = useState<{
    code: string,
    clientCode: string
  }>({
    code: generateCapture(previous.current || "arfana"),
    clientCode: "",
  });
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');
  const [showPassword, setShowPassword] = useState(false);

  // height and width calculate
  const height = useWindowDimensions().height;
  const width = useWindowDimensions().width;
  const isLandScape = width > height;

  const handleSubmit = () => {
    // verification capture
    if (captureVerification?.clientCode === "") {
      setAlertMessage("Please enter Capture code");
      setAlertType('error')
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 1000);
      return;
    } else if (captureVerification?.clientCode !== captureVerification?.code) {
      setAlertMessage("Not Correct Capture code");
      setAlertType('error')
      setAlertVisible(true)

      setTimeout(() => {
        setAlertVisible(false);
      }, 1000);
      return;
    } else {
      previous.current = (captureVerification?.code);
      setAlertVisible(false);
    }

    if (username && password) {
      setLoading(true);
      onLogin(username, password);
      setLoading(false);
    }
  };

  let [carosual, setCarosual] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setCarosual((prev) => (prev === 1 ? 0 : 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const theme1 = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#1abc9c', // Custom primary color (greenish)
      accent: '#3498db', // Custom accent color (blueish)
      text: '#34495e', // Darker text color
      placeholder: '#7f8c8d', // Grey placeholder text
      surfaceVariant: '#ecf0f1', // Background color for outlined input
      error: '#e74c3c', // Red for error states,
      secondary: '#3498db',
    },
    roundness: 8, // Rounded corners for components
  };
  // Custom handle Close alert visible function
  function handleVisible() {
    setAlertVisible(false);
  }
  return (
    isLandScape ?
      <View style={[styles.landscapeContainer]}>
        <View style={styles.landscapeImageView}>
          {
            carosual === 1 ? <Image source={require('../../assets/images/project-logo.png')} style={styles.landscapeImage} /> :
              <Image source={{ uri: "data:image/png;base64,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" }} style={styles.landscapeImage} />
          }
        </View>
        <View style={[styles.formLanscape, , styles.landscapeTop]}>
          <Text style={styles.title}>Login</Text>
          <View style={styles.inputView}>
            <TextInput
              mode="outlined"
              label="Username"
              placeholder="Enter your Username"
              value={username}
              onChangeText={(newUsername) => setUsername(newUsername)}
              style={styles.input}
              outlineColor={theme1.colors.primary}
              activeOutlineColor={theme1.colors.accent}
              error={false}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              mode="outlined"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}   // jab showPassword true ho to text dikhega
              value={password}
              onChangeText={setPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}  // toggle logic
                />
              }
            />
          </View>
          <View>
            {/* <Text>CAPTURE VERIFICATION</Text> */}
            <View style={styles.captureCodeView}>
              <Text style={styles.captureCodeText}>
                {captureVerification?.code}
              </Text>
              <Pressable onPress={() => {
                setCaptureVerification({
                  code: generateCapture(previous.current || "abcsef"),
                  clientCode: "",
                })
              }} style={styles.rotateIcon}>
                <Text>
                  <Feather name="rotate-ccw" size={24} color="black" />
                </Text>
              </Pressable>
            </View>
            <TextInput
              mode="outlined"
              label="Enter Capture"
              placeholder="Enter Above Capture"
              onChangeText={(newCapture) => {
                setCaptureVerification({
                  code: captureVerification?.code,
                  clientCode: newCapture
                })
              }}
              left={<TextInput.Icon icon="robot" />} // Icon on the left side
              style={styles.input}
              outlineColor={theme1.colors.primary}
              activeOutlineColor={theme1.colors.accent}
              error={false}
            />
          </View>
          <Button
            mode="outlined"
            onPress={handleSubmit}
            disabled={!username || !password}
            style={[
              styles.button,
              { backgroundColor: theme.colors.secondary }, // You can also directly set the color here
              // Add a disabled style conditionally
              (!username || !password) && styles.disabledButton,
            ]}
            labelStyle={styles.buttonLabel} // Style for the text inside the button
          >
            Login
          </Button>
        </View>
        <AlertMessage
          key={alertMessage + alertVisible}
          visible={alertVisible}
          message={alertMessage}
          type={alertType}
          onDismiss={() => setAlertVisible(false)}
          isLandScape={isLandScape}
          handleVisible={handleVisible}
        />
      </View>
      :
      <KeyboardAvoidingView
        behavior={"padding"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View>
              <View style={styles.imageBox}>

                <Image source={require('../../assets/images/project-logo.png')} style={styles.image1} />

                <Image source={{ uri: "data:image/png;base64,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" }} style={styles.image1} />
              </View>
              <Text style={styles.title}>
                Login
              </Text>
            </View>
            <View style={styles.inputView}>
              <TextInput
                mode="outlined"
                label="Username"
                placeholder="Enter your Username"
                value={username}
                onChangeText={(newUsername) => setUsername(newUsername)}
                left={<TextInput.Icon icon="account" />} // Icon on the left side
                style={styles.input}
                outlineColor={theme1.colors.primary}
                activeOutlineColor={theme1.colors.accent}
                error={false}
              />
            </View>
            <View style={styles.inputView}>
              <TextInput
                mode="outlined"
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={!showPassword} // Obscures the entered text, useful for passwords
                value={password}
                onChangeText={(newPassword) => setPassword(newPassword)}
                left={<TextInput.Icon icon="lock" />} // Icon on the left side
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}  // toggle logic
                  />
                }
                style={styles.input}
                outlineColor={theme1.colors.primary}
                activeOutlineColor={theme1.colors.accent}
                error={false}
              />
            </View>
            <View>
              {/* <Text>CAPTURE VERIFICATION</Text> */}
              <View style={styles.captureCodeView}>
                <Text style={styles.captureCodeText}>
                  {captureVerification?.code}
                </Text>
                <Pressable onPress={() => {
                  setCaptureVerification({
                    code: generateCapture(previous.current || "abcsef"),
                    clientCode: "",
                  })
                }} style={styles.rotateIcon}>
                  <Text>
                    <Feather name="rotate-ccw" size={24} color="black" />
                  </Text>
                </Pressable>
              </View>
              <TextInput
                mode='outlined'
                label="Enter Capture"
                placeholder="Enter Above Capture"
                onChangeText={(newCapture) => {
                  setCaptureVerification({
                    code: captureVerification?.code,
                    clientCode: newCapture
                  })
                }}
                left={<TextInput.Icon icon="robot" />} // Icon on the left side
                style={styles.input}
                outlineColor={theme1.colors.primary}
                activeOutlineColor={theme1.colors.accent}
                error={false}
              />
            </View>
            <Button
              mode="outlined"
              onPress={handleSubmit}
              disabled={!username || !password}
              style={[
                styles.button,
                { backgroundColor: theme.colors.secondary }, // You can also directly set the color here
                // Add a disabled style conditionally
                (!username || !password) && styles.disabledButton,
              ]}
              labelStyle={styles.buttonLabel} // Style for the text inside the button
            >
              Login
            </Button>
          </Card.Content>
        </Card>
        <AlertMessage
          key={alertMessage + alertVisible}
          visible={alertVisible}
          message={alertMessage}
          type={alertType}
          onDismiss={() => setAlertVisible(false)}
          isLandScape={isLandScape}
          handleVisible={handleVisible}
        />
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 17,
    backgroundColor: 'white',
    alignContent: "center",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white"
  },
  title: {
    fontSize: 34,
    alignSelf: 'center',
    marginBottom: 7,
    fontFamily: "Cochin",
    fontWeight: "900",
  },
  inputView: {
    marginBottom: 3
  },
  imageBox: {
    display: "flex",
    flexDirection: "row",
    gap: 1,
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 1
  },
  image1: {
    width: 120,
    height: 100,
    alignSelf: 'center',
    resizeMode: "stretch",
    marginBottom: 2,
  },
  input: {
    // marginBottom: 1,
  },
  errorText: {
    color: "red",
    marginBottom: 22
  },
  captureCodeView: {
    flexDirection: 'row', // To arrange the text and icon horizontally
    alignItems: 'flex-start', // Vertically center the text and icon
    justifyContent: 'space-between', // Distribute space between the text and icon
    backgroundColor: '#ecf0f1', // A light background color
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 15, // Horizontal padding
    paddingVertical: 10, // Vertical padding
    marginVertical: 10, // Margin from other components
    borderWidth: 1, // Add a border
    borderColor: '#bdc3c7', // Border color
    height: 50
  },
  captureCodeText: {
    fontSize: 20, // Font size for the captcha code
    fontWeight: 'bold', // Bold font weight
    letterSpacing: 2, // Space between letters for readability
    color: '#2c3e50', // Dark text color
  },
  rotateIcon: {
    padding: 2, // Padding around the icon to increase the clickable area
  },
  landscapeContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
  },
  landscapeImageView: {
    display: "flex",
    flexDirection: "column",
    width: "50%"
  },
  landscapeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  formLanscape: {
    display: "flex",
    flexDirection: "column",
    width: "50%",
    height: "100%",
    paddingHorizontal: 60
  },
  button: {
    marginVertical: 10, // Add vertical spacing
    borderRadius: 8,    // Rounded corners
    borderWidth: 1,     // Add a border
    borderColor: '#3498db', // Border color
    paddingVertical: 5,
    marginBottom: 5,
    // Other styles like padding or width can also be added
  },
  buttonLabel: {
    fontSize: 18,        // Customize font size
    fontWeight: 'bold',  // Make text bold
    color: 'white',      // Text color
  },
  disabledButton: {
    backgroundColor: '#ccc', // A lighter color for the disabled state
    borderColor: '#aaa'    //  A lighter border color for the disabled state
  },
  landscapeTop: {
    marginBottom: 12
  }
});