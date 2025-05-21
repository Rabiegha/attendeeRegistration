import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Platform } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import SimpleNavigator from './src/navigation/SimpleNavigator';
import { EventProvider } from './src/context/EventContext';
import { PrintStatusProvider } from './src/printing/context/PrintStatusContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSelectedEventFromStorage } from './src/redux/slices/eventsSlice';

// Component to load persisted data after Redux is initialized
const DataLoader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load selected event from AsyncStorage
    const loadSelectedEvent = async () => {
      try {
        const storedEvent = await AsyncStorage.getItem('selectedEvent');
        if (storedEvent) {
          const parsedEvent = JSON.parse(storedEvent);
          dispatch(setSelectedEventFromStorage(parsedEvent));
          console.log('Loaded persisted event:', parsedEvent.event_name);
        }
      } catch (error) {
        console.error('Failed to load persisted event:', error);
      }
    };

    loadSelectedEvent();
  }, [dispatch]);

  return null; // This component doesn't render anything
};

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <EventProvider>
          <PrintStatusProvider>
            <DataLoader />
            <SafeAreaView style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
              <View style={styles.content}>
                <SimpleNavigator />
              </View>
            </SafeAreaView>
          </PrintStatusProvider>
        </EventProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
});

export default App;
