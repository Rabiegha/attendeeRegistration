import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import ConnexionComponent from '../../components/screens/ConnexionComponent';

import globalStyle from '../../assets/styles/globalStyle';
import Spinner from 'react-native-loading-spinner-overlay';
import FailComponent from '../../components/elements/notifications/FailComponent';
import {loginThunk} from '../../redux/thunks/auth/loginThunk';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '../../redux/store';
import {resetError} from '../../redux/slices/authSlice';
import {
  selectError,
  selectIsLoading,
} from '../../redux/selectors/auth/authSelectors';

const ConnexionScreen = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');


  const error = useSelector(selectError);
  const isLoading = useSelector(selectIsLoading);
  
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      // Reset the status bar style when component unmounts
      StatusBar.setBarStyle('default');
    };
  }, []);

  const dispatch = useAppDispatch();

  const handleLogin = (userName: string, password: string) => {
    dispatch(
      loginThunk({
        email: userName,
        password: password,
      }),
    );
    dispatch(resetError());
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(resetError());
      }, 5000); // Reset error after 5 seconds

      return () => clearTimeout(timer); // Cleanup if component unmounts
    }
  }, [error, dispatch]); // Runs when error changes

  return (
    <View style={[globalStyle.backgroundWhite, styles.container]}>
      {error && (
        <FailComponent
          onClose={() => dispatch(resetError())}
          text={"Incorrect username or password"}
        />
      )}
      <Spinner visible={isLoading} />
      <View style={styles.container}>
        <Text style={styles.title}>Log in</Text>
        <ConnexionComponent
          userName={userName}
          password={password}
          setUserName={text => setUserName(text)}
          setPassword={text => setPassword(text)}
          handleLogin={() => {
            handleLogin(userName, password);
            dispatch(resetError());
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
  },
  title: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default ConnexionScreen;
