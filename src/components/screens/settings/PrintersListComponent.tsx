import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import {
  selectNodePrinterAsync,
  deselectNodePrinterAsync,
  Printer,
} from '../../../redux/slices/printerSlice';
import colors from '../../../assets/colors/colors';
import { getNodePrinters } from '../../../services/printNodeService';
import Spinner from 'react-native-loading-spinner-overlay';
import Search from '../../elements/Search';

interface PrintersListProps {
  refreshCallback?: (refreshFunction: () => void) => void;
}

const PrintersList = ({ refreshCallback }: PrintersListProps) => {
  const [nodePrinters, setNodePrinters] = useState<Printer[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const [loadingNodePrinters, setLoadingNodePrinters] = useState(true);
  const [loadingPrinter, setLoadingPrinter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedNodePrinter = useSelector(
    (state: any) => state.printers.selectedNodePrinter,
  );

  const fetchPrinters = useCallback(async (withSpinner: boolean) => {
    if (withSpinner) setLoadingNodePrinters(true);
    setError(false);
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoadingNodePrinters(false);
      setRefreshing(false);
      setError(true);
      Alert.alert(
        'Timeout', 
        'Printer retrieval took too long. Please try again.',
        [
          {text: 'OK'},
          {text: 'Retry', onPress: () => fetchPrinters(true)}
        ]
      );
    }, 8000); // 8 second timeout

    try {
      const printersList = await getNodePrinters();
      clearTimeout(timeout);
      setNodePrinters(printersList);
    } catch (err) {
      clearTimeout(timeout);
      setError(true);
      Alert.alert(
        'Error', 
        'Unable to retrieve printers.',
        [
          {text: 'OK'},
          {text: 'Retry', onPress: () => fetchPrinters(true)}
        ]
      );
    } finally {
      setLoadingNodePrinters(false);
      setRefreshing(false);
    }
  }, []);

  /* initial load */
  useEffect(() => {
    fetchPrinters(true);
  }, [fetchPrinters]);

  const triggerRefresh = () => {
    setRefreshing(true);
    fetchPrinters(false); // no full-screen spinner
  };
  
  // Expose the refresh function to parent component if provided
  useEffect(() => {
    if (refreshCallback) {
      refreshCallback(triggerRefresh);
    }
  }, [refreshCallback]);

  // Filter printers based on search query and state
  const filteredPrinters = nodePrinters.filter(printer => {
    const matchesSearch = printer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return printer.state === 'online' && matchesSearch;
  });
  
  // Keep the original filters for reference
  const onlinePrinters = nodePrinters.filter(
    printer => printer.state === 'online',
  );
  const offlinePrinters = nodePrinters.filter(
    printer => printer.state === 'offline',
  );

  const handleSelectNodePrinter = async (printer: Printer) => {
    setLoadingPrinter(true);
    
    // Set a timeout to prevent infinite loading
    const selectionTimeout = setTimeout(() => {
      setLoadingPrinter(false);
      Alert.alert(
        'Timeout', 
        'Printer selection took too long. Please try again.',
        [{text: 'OK'}]
      );
    }, 8000); // 8 second timeout
    
    try {
      if (selectedNodePrinter && selectedNodePrinter.id === printer.id) {
        await dispatch(deselectNodePrinterAsync());
      } else {
        await dispatch(selectNodePrinterAsync(printer));
      }
      clearTimeout(selectionTimeout);
    } catch (error) {
      clearTimeout(selectionTimeout);
      Alert.alert(
        'Error', 
        'Printer selection failed. Please try again.',
        [{text: 'OK'}]
      );
    } finally {
      setLoadingPrinter(false);
    }
  };

  // Function to highlight matching text in printer names
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <Text>{text}</Text>;
    }
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <Text>
        {parts.map((part, i) => {
          const isHighlighted = part.toLowerCase() === highlight.toLowerCase();
          return (
            <Text
              key={i}
              style={{
                backgroundColor: isHighlighted ? colors.green + '40' : undefined,
                fontWeight: isHighlighted ? '700' : '400',
                color: isHighlighted ? colors.green : undefined,
              }}>
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.errorText}>Failed to load printers</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchPrinters(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Spinner
        visible={loadingNodePrinters || loadingPrinter}
        textContent="Loading..."
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search printers..."
        />
      </View>
      
      {/* Online Printers */}
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.onlineIndicator} />
          <Text style={styles.title}>Online Printers</Text>
        </View>
        {loadingNodePrinters ? (
          <Text style={styles.status}>Loading printers...</Text>
        ) : filteredPrinters.length > 0 ? (
          <FlatList
            data={filteredPrinters}
            keyExtractor={item => item.id.toString()}
            refreshing={refreshing} 
            onRefresh={triggerRefresh}
            contentContainerStyle={styles.printersListContent}
            style={styles.printersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectNodePrinter(item)}
                style={[
                  styles.printerItem,
                  {
                    backgroundColor:
                      selectedNodePrinter && selectedNodePrinter.id === item.id
                        ? colors.green
                        : colors.lightGrey,
                  },
                ]}>
                <View>
                  <Text style={[
                    styles.printerName,
                    {
                      color:
                        selectedNodePrinter && selectedNodePrinter.id === item.id
                          ? 'white'
                          : colors.dark,
                      fontWeight:
                        selectedNodePrinter && selectedNodePrinter.id === item.id
                          ? '700'
                          : '400',
                    },
                  ]}>
                    {highlightText(item.name || 'Unknown Printer', searchQuery)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.printerState,
                    {
                      color:
                        selectedNodePrinter && selectedNodePrinter.id === item.id
                          ? 'white'
                          : colors.grey,
                      fontWeight:
                        selectedNodePrinter && selectedNodePrinter.id === item.id
                          ? '700'
                          : '400',
                    },
                  ]}>
                  {`(${item.state})`}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : searchQuery ? (
          <Text style={styles.emptyMessage}>No printers matching "{searchQuery}"</Text>
        ) : (
          <Text style={styles.emptyMessage}>No printers available</Text>
        )}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  searchContainer: {
    paddingVertical: 10,
    marginTop: 10,
    width: '100%',
    maxWidth: isTablet ? '100%' : undefined,
    alignSelf: isTablet ? 'stretch' : 'center',
  },
  container: {
    flex: 1,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    maxWidth: '100%',
  },
  printersList: {
    flex: 1,
    width: '100%',
  },
  printersListContent: {
    paddingBottom: 100,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    marginRight: 8,
  },
  offlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 8,
  },
  title: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  printerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  printerName: {
    fontSize: isTablet ? 18 : 16,
  },
  printerState: {
    fontSize: isTablet ? 14 : 12,
  },
  status: {
    color: colors.grey,
    marginVertical: 10,
    fontSize: isTablet ? 16 : 14,
  },
  emptyMessage: {
    fontSize: isTablet ? 18 : 16,
    color: colors.grey,
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: isTablet ? 18 : 16,
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
});

export default PrintersList;
