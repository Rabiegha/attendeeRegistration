import React, {useEffect, useState} from 'react';
import {View, StyleSheet, StatusBar, Platform, Alert, Text, TouchableOpacity} from 'react-native';
import Search from '../../components/elements/Search';
import HeaderEvent from '../../components/elements/header/HeaderEvent';
import globalStyle from '../../assets/styles/globalStyle';
import {useEvent} from '../../context/EventContext';
import Spinner from 'react-native-loading-spinner-overlay';
import {useNavigation} from '../../navigation/SimpleNavigator';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '../../redux/store';
// We'll use the regular useDispatch instead of useAppDispatch
import {selectCurrentUserId, selectIsLoading} from '../../redux/selectors/auth/authSelectors';
import {logoutThunk} from '../../redux/thunks/auth/logoutThunk';
import {selectEvent} from '../../redux/slices/eventsSlice';
import {Event} from '../../types/event.types';
import FutureEventsScreen from './FutureEventsScreen';
import PastEventsScreen from './PastEventsScreen';
import colors from '../../assets/colors/colors';



// Main EventsScreen component
const EventsScreen = () => {
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  const userId = useSelector(selectCurrentUserId);
  const {clearSessionDetails} = useEvent();
  const isLoading = useSelector(selectIsLoading);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const handleEventSelect = (event: Event) => {
    // Create a complete event object with all required fields
    const completeEvent = {
      ...event,
      // Ensure these fields exist
      event_id: event.event_id || event.id || '',
      event_name: event.event_name || event.title || 'Selected Event',
      ems_secret_code: event.ems_secret_code || ''
    };
    
    // Log what we're about to store
    console.log('STORING EVENT:', JSON.stringify(completeEvent, null, 2));
    
    // Store the selected event in Redux
    dispatch(selectEvent(completeEvent));
    
    // Navigate to the CreateAttendee screen with a slight delay to ensure state is updated
    setTimeout(() => {
      navigation.navigate('CreateAttendee');
    }, 100);
  };

  // Using the dispatch from above

  const handleNavigateToPrinterSettings = () => {
    navigation.navigate('PrinterSettings');
  };

  const handleLogOut = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              console.log('Logging out user:', userId);
              // Dispatch the logout thunk
              const result = await dispatch(logoutThunk()).unwrap();
              console.log('Logout successful');
              // Clear any session details
              clearSessionDetails();
            } catch (err) {
              // Handle logout error
              const errorMessage = err instanceof Error ? err.message : 'There was a problem logging out';
              console.error('Logout error:', errorMessage);
              Alert.alert('Logout Failed', errorMessage);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(searchQuery ? 1 : 0);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Simple tab state to switch between future and past events
  const [activeTab, setActiveTab] = useState<'future' | 'past'>('future');

  return (
    <View style={globalStyle.backgroundWhite}>
      <Spinner visible={isLoading} />
      <HeaderEvent
        onLeftPress={clearSearch}
        onRightPress={handleLogOut}
        onSettingsPress={handleNavigateToPrinterSettings}
        opacity={opacity}
      />
      
      {/* Search bar with proper padding and styling */}
      <View style={styles.searchContainer}>
        <Search onChange={text => setSearchQuery(text)} value={searchQuery} placeholder="Search events..." />
      </View>
      
      {/* Simple tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'future' && styles.activeTab]} 
          onPress={() => setActiveTab('future')}
        >
          <Text style={[styles.tabText, activeTab === 'future' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]} 
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>
      
      {/* Show the active tab content */}
      <View style={styles.tabContent}>
        {activeTab === 'future' ? (
          <FutureEventsScreen searchQuery={searchQuery} onEventSelect={handleEventSelect} />
        ) : (
          <PastEventsScreen searchQuery={searchQuery} onEventSelect={handleEventSelect} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
    maxWidth: '100%',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch', // For tablet support
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    width: '100%',
    maxWidth: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
  },
  tabText: {
    fontSize: 16,
    color: colors.grey,
  },
  activeTabText: {
    color: colors.green,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
  },
});

export default EventsScreen;
