import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../redux/selectors/auth/authSelectors';
import { selectSelectedEvent } from '../redux/selectors/events/eventsSelectors';
import ConnexionScreen from '../screens/auth/ConnexionScreen';
import EventsScreen from '../screens/event/EventsScreen';
import CreateAttendeeScreen from '../screens/attendee/CreateAttendeeScreen';
import AttendeeFormScreen from '../screens/attendee/AttendeeFormScreen';
import BadgePreviewScreen from '../screens/attendee/BadgePreviewScreen';
import ModifyAttendeeScreen from '../screens/attendee/ModifyAttendeeScreen';
import PrinterSettingsScreen from '../screens/settings/PrinterSettingsScreen';

// Create a navigation context to handle screen navigation
type NavigationContextType = {
  navigate: (screenName: string, params?: any) => void;
  goBack: () => void;
  resetToScreen: (screenName: string, params?: any) => void;
  currentScreen: string;
  params?: any;
};

const NavigationContext = createContext<NavigationContextType>({
  navigate: () => {},
  goBack: () => {},
  resetToScreen: () => {},
  currentScreen: '',
  params: undefined,
});

// Custom hook to use navigation
export const useNavigation = () => useContext(NavigationContext);

/**
 * A simple navigator that handles authentication flow and screen navigation
 * without using React Navigation library
 */
const SimpleNavigator = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const selectedEvent = useSelector(selectSelectedEvent);
  
  // Track navigation history for back button functionality
  const [history, setHistory] = useState<string[]>([]);
  const [currentScreen, setCurrentScreen] = useState<string>(
    isLoggedIn ? 'Events' : 'Connexion'
  );
  const [params, setParams] = useState<any>(undefined);

  // Update the current screen when login state changes
  useEffect(() => {
    const initialScreen = isLoggedIn ? 'Events' : 'Connexion';
    setCurrentScreen(initialScreen);
    setHistory([initialScreen]);
  }, [isLoggedIn]);

  // Navigation functions
  const navigate = (screenName: string, screenParams?: any) => {
    setHistory(prev => [...prev, screenName]);
    setCurrentScreen(screenName);
    setParams(screenParams);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];
      setCurrentScreen(previousScreen);
      setHistory(newHistory);
    }
  };
  
  // Reset navigation stack to a specific screen
  const resetToScreen = (screenName: string, screenParams?: any) => {
    setHistory([screenName]); // Reset history to only contain the target screen
    setCurrentScreen(screenName);
    setParams(screenParams);
  };

  // Render the current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Connexion':
        return <ConnexionScreen />;
      case 'Events':
        return <EventsScreen />;
      case 'CreateAttendee':
        return <CreateAttendeeScreen />;
      case 'AttendeeForm':
        return <AttendeeFormScreen />;
      case 'BadgePreview':
        return <BadgePreviewScreen route={{ params }} />;
      case 'ModifyAttendee':
        return <ModifyAttendeeScreen route={{ params }} />;
      case 'PrinterSettings':
        return <PrinterSettingsScreen />;
      default:
        return <EventsScreen />;
    }
  };

  return (
    <NavigationContext.Provider value={{ navigate, goBack, resetToScreen, currentScreen, params }}>
      <View style={styles.container}>
        {renderScreen()}
      </View>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
  },
});

export default SimpleNavigator;
