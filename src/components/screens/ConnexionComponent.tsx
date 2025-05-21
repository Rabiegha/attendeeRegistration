import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import colors from '../../assets/colors/colors';
import globalStyle from '../../assets/styles/globalStyle';
import LargeButton from '../elements/buttons/LargeButton';
import Icons from '../../assets/images/icons';

interface ConnexionComponentProps {
  userName: string;
  password: string;
  setUserName: (text: string) => void;
  setPassword: (text: string) => void;
  handleLogin: () => void;
}

const ConnexionComponent = ({
  userName,
  password,
  setUserName,
  setPassword,
  handleLogin,
}: ConnexionComponentProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <TextInput
        style={globalStyle.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
        placeholderTextColor={colors.grey}
        autoCapitalize="none"
      />
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={[globalStyle.input, styles.passwordInput]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.grey}
        />
        <TouchableOpacity
          style={styles.togglePasswordButton}
          onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={showPassword ? Icons.PasVu : Icons.Vu}
            style={styles.togglePasswordIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <LargeButton
          title="Login"
          onPress={handleLogin}
          backgroundColor={colors.green}
          loading={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch', // Ensure full width on tablet screens
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40,
    marginBottom: 0,
  },
  togglePasswordButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  togglePasswordIcon: {
    width: 20,
    height: 20,
    tintColor: colors.green,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
    alignSelf: 'stretch', // Use stretch instead of center for tablet layouts
  },
});

export default ConnexionComponent;
