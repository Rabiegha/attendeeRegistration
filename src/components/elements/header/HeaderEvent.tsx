import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import colors from '../../../assets/colors/colors';
import Icons from '../../../assets/images/icons';

interface HeaderEventProps {
  onLeftPress: () => void;
  onRightPress: () => void;
  onSettingsPress?: () => void;
  opacity: number;
}

const HeaderEvent = ({ onLeftPress, onRightPress, onSettingsPress, opacity }: HeaderEventProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, { opacity }]}
          onPress={onLeftPress}
          disabled={opacity === 0}>
          <Image
            source={Icons.Retour}
            style={styles.icon}
          />
        </TouchableOpacity>
        <View style={styles.rightButtonsContainer}>
          <TouchableOpacity style={styles.button} onPress={onRightPress}>
            <Image
              source={Icons.LogOut}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    height: 30,
    width: 120,
  },
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 10,
    marginRight: 5,
  },
  settingsIcon: {
    width: 24,
    height: 24,
    tintColor: colors.green,
  },
});

export default HeaderEvent;
