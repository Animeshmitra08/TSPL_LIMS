import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions, Animated } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

type AlertType = 'success' | 'error' | 'info' | 'warning';

type AlertMessageProps = {
  visible: boolean;
  message: string;
  type?: AlertType;
  onDismiss: () => void;
  isLandScape?: boolean;
  handleVisible?: () => void;
  duration?: number; // Auto-dismiss duration in milliseconds
  position?: 'top' | 'bottom' | 'center';
  showCloseButton?: boolean;
};

const backgroundColors: Record<AlertType, string> = {
  success: '#d4edda',
  error: '#f8d7da',
  info: '#d1ecf1',
  warning: '#fff3cd',
};

const textColors: Record<AlertType, string> = {
  success: '#155724',
  error: '#721c24',
  info: '#0c5460',
  warning: '#856404',
};

const borderColors: Record<AlertType, string> = {
  success: '#c3e6cb',
  error: '#f5c6cb',
  info: '#bee5eb',
  warning: '#ffeaa7',
};

const icons: Record<AlertType, string> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'information',
  warning: 'alert',
};

const AlertMessage: React.FC<AlertMessageProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
  isLandScape = false,
  handleVisible,
  duration = 4000,
  position = 'top',
  showCloseButton = true,
}) => {
  const { height, width } = useWindowDimensions();
  const pageLandscape = width > height;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<number | null>(null);

  // Auto-dismiss logic
  useEffect(() => {
    if (visible && duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  // Animation logic
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: position === 'bottom' ? 100 : -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, position]);

  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (handleVisible) {
      handleVisible();
    } else {
      onDismiss();
    }
  };

  if (!visible) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      left: 16,
      right: 16,
      zIndex: 1000,
    };

    if (position === 'bottom') {
      return { ...baseStyles, bottom: 20 };
    } else if (position === 'center') {
      return { 
        ...baseStyles, 
        top: height / 2 - 50,
        alignSelf: 'center' as const,
      };
    } else {
      // top position
      return { 
        ...baseStyles, 
        top: pageLandscape || isLandScape ? 10 : 60 
      };
    }
  };

  return (
    <Animated.View 
      style={[
        getPositionStyles(),
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Card 
        style={[
          styles.card, 
          { 
            backgroundColor: backgroundColors[type], 
            borderColor: borderColors[type],
            // Add shadow for better visibility
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }
        ]}
      >
        <Card.Content style={styles.content}>
          {/* Alert Icon */}
          <IconButton 
            icon={icons[type]} 
            size={20} 
            iconColor={textColors[type]}
            style={styles.alertIcon}
          />
          
          {/* Message Text */}
          <Text 
            style={[
              styles.text, 
              { color: textColors[type] }
            ]}
            numberOfLines={3}
          >
            {message}
          </Text>
          
          {/* Close Button */}
          {showCloseButton && (
            <IconButton 
              icon="close" 
              size={18} 
              iconColor={textColors[type]}
              onPress={handleDismiss}
              style={styles.closeButton}
            />
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 48,
  },
  alertIcon: {
    marginRight: 4,
    marginLeft: -4,
    marginTop: -4,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 8,
    marginHorizontal: 4,
  },
  closeButton: {
    marginLeft: 4,
    marginRight: -4,
    marginTop: -4,
  },
});

export default AlertMessage;