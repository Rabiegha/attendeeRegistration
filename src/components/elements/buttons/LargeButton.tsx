import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../../../assets/colors/colors';

interface LargeButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
}

const LargeButton = ({
  title,
  onPress,
  backgroundColor = colors.primary,
  textColor = colors.white,
  disabled = false,
  loading = false,
}: LargeButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? colors.lightGrey : backgroundColor },
        styles.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullWidth: {
    alignSelf: 'stretch', // Use stretch instead of center for tablet layouts
  },
});

export default LargeButton;
