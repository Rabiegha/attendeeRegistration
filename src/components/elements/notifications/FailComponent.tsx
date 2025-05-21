import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import colors from '../../../assets/colors/colors';

interface FailComponentProps {
  text: string;
  onClose: () => void;
  duration?: number;
}

const FailComponent = ({ text, onClose, duration = 5000 }: FailComponentProps) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto close after duration
    const timer = setTimeout(() => {
      fadeOut();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const fadeOut = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.content}>
        <Text style={styles.text}>{text}</Text>
        <TouchableOpacity onPress={fadeOut} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: '100%', // Ensure full width on tablet screens
  },
  content: {
    backgroundColor: colors.danger,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
    alignSelf: 'stretch', // Use stretch instead of center for tablet layouts
  },
  text: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
  },
  closeText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default FailComponent;
