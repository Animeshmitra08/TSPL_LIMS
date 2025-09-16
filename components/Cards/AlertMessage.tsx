import React from 'react';
import { StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

type AlertType = 'success' | 'error' | 'info';

type AlertMessageProps = {
  visible: boolean;
  message: string;
  type?: AlertType;
  onDismiss: () => void;
  isLandScape: boolean;
  handleVisible: () => void;
  style?: ViewStyle; 
};


const backgroundColors: Record<AlertType, string> = {
  success: '#d4edda',
  error: '#f8d7da',
  info: '#d1ecf1',
};

const textColors: Record<AlertType, string> = {
  success: '#155724',
  error: '#721c24',
  info: '#0c5460',
};


const AlertMessage: React.FC<AlertMessageProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
  isLandScape,
  handleVisible,
  style
}) => {
  const height = useWindowDimensions().height;
  const width = useWindowDimensions().width;
  const pageLandscape = width > height;
  if (visible === true) {
    setTimeout(() => {
      handleVisible();
    }, 2000);
  }
  if (!visible) return null;
  return (
    <View style={[styles.container
      , !isLandScape && !pageLandscape ? styles.isLandscapeAlert : null,
      style,
    ]}>
      <Card style={[styles.card, { backgroundColor: backgroundColors[type], borderColor: textColors[type] }]}>
        <Card.Content style={styles.content}>
          <Text style={[styles.text, { color: textColors[type] }]}>
            {message}
          </Text>
          <IconButton icon="close" size={20} onPress={onDismiss} />
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // top: 10,
    zIndex: 1000,
    height: "auto",
    right: 10,
    left: "50%"
  },
  card: {
    borderRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // height: 50,
  },
  text: {
    // flex: 1,
    fontSize: 14,
    fontWeight: '500',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  isLandscapeAlert: {
    top: 0,
    right: 0,
    left: "10%",
  },
});

export default AlertMessage;