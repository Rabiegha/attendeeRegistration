import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image, ListRenderItem, RefreshControl } from 'react-native';
import Search from '../../components/elements/Search';
import ErrorView from '../../components/elements/ErrorView';
import { useSelector } from 'react-redux';
import { selectCurrentUserId } from '../../redux/selectors/auth/authSelectors';
import { selectPastEvents, selectPastEventsLoading } from '../../redux/selectors/events/eventsSelectors';
import { useAppDispatch } from '../../redux/store';
import { fetchPastEvents } from '../../redux/thunks/event/fetchPastEventsThunk';
import globalStyle from '../../assets/styles/globalStyle';
import colors from '../../assets/colors/colors';
import Spinner from 'react-native-loading-spinner-overlay';
import { Event } from '../../types/event.types';
import Icons from '../../assets/images/icons';

interface PastEventsScreenProps {
  searchQuery: string;
  onEventSelect: (event: Event) => void;
  onSearchChange?: (text: string) => void;
}

const PastEventsScreen = ({ searchQuery: externalSearchQuery, onEventSelect, onSearchChange }: PastEventsScreenProps) => {
  const dispatch = useAppDispatch();
  const userId = useSelector(selectCurrentUserId);
  const events = useSelector(selectPastEvents);
  const isLoading = useSelector(selectPastEventsLoading);
  const [refreshing, setRefreshing] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Use either the external search query (from parent) or internal one
  const searchQuery = externalSearchQuery || internalSearchQuery;

  const fetchEvents = useCallback(() => {
    if (userId) {
      setError(null);
      dispatch(fetchPastEvents({ userId }))
        .unwrap()
        .catch((err: string) => {
          console.error('Error fetching past events:', err);
          setError(err);
        });
    }
  }, [dispatch, userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    if (userId) {
      setRefreshing(true);
      setError(null);
      dispatch(fetchPastEvents({ userId }))
        .unwrap()
        .catch((err: string) => {
          console.error('Error refreshing past events:', err);
          setError(err);
        })
        .finally(() => {
          setRefreshing(false);
        });
    }
  }, [dispatch, userId]);

  const filteredEvents = events.filter(event => {
    const query = searchQuery.toLowerCase();
    const title = event.title?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';
    const location = event.location?.toLowerCase() || '';
    
    return title.includes(query) || 
           description.includes(query) || 
           location.includes(query);
  });

  const renderEventItem: ListRenderItem<Event> = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard} 
      onPress={() => onEventSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>{item.title || item.event_name}</Text>
        <Text style={styles.eventDate}>{formatDate(item.start_date || item.nice_start_datetime)}</Text>
      </View>
      <View style={styles.eventBody}>
        <Text style={styles.eventDescription} numberOfLines={2}>{item.description || ''}</Text>
        {(item.location || item.event_type_name) && (
          <View style={styles.locationContainer}>
            <Image 
              source={Icons.Infos} 
              style={styles.locationIcon} 
            />
            <Text style={styles.eventLocation} numberOfLines={1}>{item.location || item.event_type_name}</Text>
          </View>
        )}
        {(item.organizer || item.event_team_members) && (
          <View style={styles.locationContainer}>
            <Image 
              source={Icons.Participant} 
              style={styles.locationIcon} 
            />
            <Text style={styles.eventLocation} numberOfLines={1}>{item.organizer || item.event_team_members}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    // For nice_start_datetime format (e.g., "27/05/2025 11:00 AM")
    if (dateString.includes('/')) {
      return dateString;
    }
    // For standard date format
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString; // Return as is if parsing fails
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No past events found</Text>
    </View>
  );

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setInternalSearchQuery(text);
    if (onSearchChange) {
      onSearchChange(text);
    }
  };

  return (
    <View style={globalStyle.container}>
      <Spinner visible={isLoading && !error} />
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Search 
          onChange={handleSearchChange} 
          value={searchQuery} 
          placeholder="Search past events..."
        />
      </View>
      
      {/* Error view */}
      {error ? (
        <ErrorView 
          message={error}
          onRetry={fetchEvents}
        />
      ) : filteredEvents.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No past events found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id?.toString() || item.event_id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.green]}
              tintColor={colors.green}
            />
          }
        />
      )}
    </View>
  );
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const styles = StyleSheet.create({
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
  listContainer: {
    padding: 20,
    paddingTop: 10,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    flexGrow: 1, // Ensure full width on tablet screens
  },
  eventCard: {
    ...globalStyle.card,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: '100%', // Ensure full width on tablet screens
    alignSelf: 'stretch', // Use stretch instead of center for tablet layouts
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 10,
  },
  eventBody: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 16,
    height: 16,
    tintColor: colors.grey,
    marginRight: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: colors.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
  },
});

export default PastEventsScreen;
