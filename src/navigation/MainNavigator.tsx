import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../redux/selectors/auth/authSelectors';
import ConnexionScreen from '../screens/auth/ConnexionScreen';
import EventsScreen from '../screens/event/EventsScreen';
import CreateAttendeeScreen from '../screens/attendee/CreateAttendeeScreen';
import PrinterSettingsScreen from '../screens/settings/PrinterSettingsScreen';
import { EventProvider } from '../context/EventContext';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Events' : 'Connexion'}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            width: '100%',
            maxWidth: '100%', // Ensure full width on tablet screens
          },
        }}>
        {isLoggedIn ? (
          // Authenticated routes
          <>
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="CreateAttendee" component={CreateAttendeeScreen} />
            <Stack.Screen name="PrinterSettings" component={PrinterSettingsScreen} />
            {/* Add more authenticated screens here */}
          </>
        ) : (
          // Unauthenticated routes
          <Stack.Screen name="Connexion" component={ConnexionScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
