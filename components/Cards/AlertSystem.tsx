import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, Animated } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

type AlertType = 'success' | 'error' | 'info' | 'warning';

type AlertMessage = {
  id: string;
  message: string;
  type?: AlertType;
  duration?: number;
  showCloseButton?: boolean;
};

type AlertSystemProps = {
  alerts: AlertMessage[];
  onDismiss: (id: string) => void;
  isLandScape?: boolean;
  position?: 'top' | 'bottom' | 'center';
  maxVisible?: number; // Maximum number of alerts to show at once
  stackVertically?: boolean; // Whether to stack alerts or replace them
};

type SingleAlertProps = {
  alert: AlertMessage;
  onDismiss: (id: string) => void;
  index: number;
  position: 'top' | 'bottom' | 'center';
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

// Single Alert Component
const SingleAlert: React.FC<SingleAlertProps> = ({ alert, onDismiss, index, position }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'bottom' ? 100 : -100)).current;
  const timeoutRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const { type = 'info', duration = 4000, showCloseButton = true } = alert;

  useEffect(() => {
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

    // Auto-dismiss logic
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsVisible(false);
    
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
    ]).start(() => {
      onDismiss(alert.id);
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.singleAlert,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: index > 0 ? 8 : 0,
          zIndex: 1000 - index, // Ensure proper stacking
        }
      ]}
    >
      <Card 
        style={[
          styles.card, 
          { 
            backgroundColor: backgroundColors[type], 
            borderColor: borderColors[type],
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5 + index, // Higher elevation for newer alerts
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
            {alert.message}
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

// Main Alert System Component
const AlertSystem: React.FC<AlertSystemProps> = ({
  alerts,
  onDismiss,
  isLandScape = false,
  position = 'top',
  maxVisible = 5,
  stackVertically = true,
}) => {
  const { height, width } = useWindowDimensions();
  const pageLandscape = width > height;

  if (!alerts.length) return null;

  const visibleAlerts = stackVertically 
    ? alerts.slice(0, maxVisible) 
    : [alerts[alerts.length - 1]]; // Show only the latest alert if not stacking

  const getContainerStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      left: 16,
      right: 16,
      zIndex: 1000,
    };

    if (position === 'bottom') {
      return { 
        ...baseStyles, 
        bottom: 20,
        flexDirection: 'column-reverse' as const, // Latest alerts at bottom
      };
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
        top: pageLandscape || isLandScape ? 10 : 20,
        flexDirection: 'column' as const, // Latest alerts at top
      };
    }
  };

  return (
    <View style={getContainerStyles()}>
      {stackVertically ? (
        // Show multiple alerts stacked
        <>
          {visibleAlerts.map((alert, index) => (
            <SingleAlert
              key={alert.id}
              alert={alert}
              onDismiss={onDismiss}
              index={index}
              position={position}
            />
          ))}
          {alerts.length > maxVisible && (
            <View style={styles.moreIndicator}>
              <Text style={styles.moreText}>
                +{alerts.length - maxVisible} more
              </Text>
            </View>
          )}
        </>
      ) : (
        // Show only the latest alert
        <SingleAlert
          key={visibleAlerts[0].id}
          alert={visibleAlerts[0]}
          onDismiss={onDismiss}
          index={0}
          position={position}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  singleAlert: {
    marginHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
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
  moreIndicator: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default AlertSystem;

// Hook for managing alerts
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const addAlert = (message: string, type: AlertType = 'info', options?: Partial<AlertMessage>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newAlert: AlertMessage = {
      id,
      message,
      type,
      duration: 4000,
      showCloseButton: true,
      ...options,
    };

    setAlerts(prev => [...prev, newAlert]);
    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const addSuccess = (message: string, options?: Partial<AlertMessage>) => 
    addAlert(message, 'success', options);

  const addError = (message: string, options?: Partial<AlertMessage>) => 
    addAlert(message, 'error', options);

  const addInfo = (message: string, options?: Partial<AlertMessage>) => 
    addAlert(message, 'info', options);

  const addWarning = (message: string, options?: Partial<AlertMessage>) => 
    addAlert(message, 'warning', options);

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    addSuccess,
    addError,
    addInfo,
    addWarning,
  };
};