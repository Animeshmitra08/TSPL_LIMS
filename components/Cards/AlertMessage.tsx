import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';

type AlertType = 'success' | 'error' | 'info';

type AlertMessageProps = {
  visible: boolean;
  message: string;
  type?: AlertType;
  onDismiss: () => void;
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
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: backgroundColors[type] }]}>
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
    top: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  card: {
    borderRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AlertMessage;