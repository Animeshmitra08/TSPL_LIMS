
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
    // Captcha validation
    if (captureVerification?.clientCode === "") {
      setAlertMessage("Please enter Capture code");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 1000);
      return;
    } else if (captureVerification?.clientCode !== captureVerification?.code) {
      setAlertMessage("Not Correct Capture code");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 1000);

      // refresh captcha
      setCaptureVerification({
        code: generateCapture(previous.current || "abcsef"),
        clientCode: "",
      });
      return;
    } else {
      previous.current = captureVerification?.code;
      setAlertVisible(false);
    }
    setLoading(true);
    onLogin(username, password);
    setLoading(false);
  };

  let [carosual, setCarosual] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setCarosual((prev) => (prev === 1 ? 0 : 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  // const theme = {
  //   ...DefaultTheme,
  //   colors: {
  //     ...DefaultTheme.colors,
  //     primary: '#111b72ff', // Custom primary color (greenish)
  //     accent: '#3498db', // Custom accent color (blueish)
  //     text: '#34495e', // Darker text color
  //     placeholder: '#7f8c8d', // Grey placeholder text
  //     surfaceVariant: '#ecf0f1', // Background color for outlined input
  //     error: '#e74c3c', // Red for error states,
  //     secondary: '#3498db',
  //   },
  //   roundness: 8, // Rounded corners for components
  // };
  // Custom handle Close alert visible function
  function handleVisible() {
    setAlertVisible(false);
  }
  return (
    isLandScape ?
      <View style={[styles.landscapeContainer]}>
        <View style={styles.landscapeImageView}>
          {/* {
            carosual === 1 ? <Image source={require('@/assets/images/vedanta-logo.png')} style={styles.landscapeImage} /> :
              <Image source={require('@/assets/images/tspl-logo.jpeg')} style={styles.landscapeImage} />
          } */}
          <Image source={require('@/assets/images/tspl-logo.jpeg')} style={styles.landscapeImage} />
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
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.accent}
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
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.accent}
              error={false}
            />
          </View>
          <Button
            mode="outlined"
            onPress={handleSubmit}
            disabled={!username || !password || loading}
            loading={loading}
            style={[
              styles.button,
              { backgroundColor: theme.colors.secondary },
              (!username || !password) && styles.disabledButton,
            ]}
            labelStyle={styles.buttonLabel}
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
        <Card style={[styles.card ]}>
          <Card.Content>
            <View>
              <View style={styles.imageBox}>
                <Image source={require('@/assets/images/tspl-logo.jpeg')} style={styles.image1} />
              </View>
              <Text style={[styles.title]}>
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
                style={[styles.input]}
                outlineColor={theme.colors.primary}
                activeOutlineColor={theme.colors.accent}
                theme={{ roundness: 10 }}
                error={false}
              />
            </View>
            <View style={styles.inputView}>
              <TextInput
                mode="outlined"
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                outlineColor={theme.colors.primary}
                activeOutlineColor={theme.colors.accent}
                theme={{ roundness: 10 }}
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
                outlineColor={theme.colors.primary}
                activeOutlineColor={theme.colors.accent}
                theme={{ roundness: 10 }}
                error={false}
              />
            </View>
            <Button
              mode="outlined"
              onPress={handleSubmit}
              disabled={!username || !password}
              style={[
                styles.button,
                { backgroundColor: theme.colors.secondary }, 
                (!username || !password) && styles.disabledButton,
              ]}
              labelStyle={styles.buttonLabel}
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
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    backgroundColor: "white"
  },
  title: {
    fontSize: 34,
    alignSelf: 'center',
    // marginVertical: 10,
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
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
  },
  image1: {
    width: 120,
    height: 100,
    alignSelf: 'center',
    resizeMode: "center",
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