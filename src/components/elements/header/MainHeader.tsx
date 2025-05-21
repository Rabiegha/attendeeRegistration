import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Platform } from 'react-native';
import colors from '../../../assets/colors/colors';
import Icons from '../../../assets/images/icons';

interface MainHeaderProps {
  title: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showBackButton?: boolean;
  rightIcon?: any;
  rightComponent?: React.ReactNode;
}

const MainHeader = ({ 
  title, 
  onLeftPress, 
  onRightPress, 
  showBackButton = false,
  rightIcon,
  rightComponent
}: MainHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBackButton && onLeftPress ? (
          <TouchableOpacity
            style={styles.leftButton}
            onPress={onLeftPress}>
            <Image
              source={Icons.Retour}
              style={styles.leftIcon}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        
        {rightComponent ? (
          <View style={styles.rightComponentContainer}>
            {rightComponent}
          </View>
        ) : onRightPress ? (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
            <Image
              source={rightIcon || Icons.LogOut}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  rightComponentContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: '100%',
  },
  button: {
    padding: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftButton: {
    padding: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButton: {
    padding: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 44,
    height: 44,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.green,
  },
  leftIcon: {
    width: 18,
    height: 28,
    tintColor: colors.green,
  },
  rightIcon: {
    width: 30,
    height: 30,
    tintColor: colors.green,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    textAlign: 'center',
  },
});

export default MainHeader;
