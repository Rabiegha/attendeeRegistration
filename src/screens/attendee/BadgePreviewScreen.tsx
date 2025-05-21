import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Linking,
  Image,
  Modal,
  FlatList,
  ScrollView,
  RefreshControl,
  TextInput
} from 'react-native';
import PinchZoomView from 'react-native-pinch-zoom-view';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { AppDispatch } from '../../redux/store';
import usePrintDocument from '../../printing/hooks/usePrintDocument';
import { getNodePrinters } from '../../services/printNodeService';
import { selectNodePrinterAsync, Printer } from '../../redux/slices/printerSlice';
import Search from '../../components/elements/Search';
import { selectCurrentUserId } from '../../redux/selectors/auth/authSelectors';
import { updateAttendee } from '../../services/attendeeService';
import PrinterSelector from '../../components/elements/PrinterSelector';
import { useNavigation } from '../../navigation/SimpleNavigator';
import colors from '../../assets/colors/colors';
import globalStyle from '../../assets/styles/globalStyle';
import MainHeader from '../../components/elements/header/MainHeader';

interface BadgePreviewScreenProps {
  route: {
    params: {
      attendeeDetails: {
        id: string;
        first_name: string;
        last_name: string;
        badge_pdf_url?: string;
        badge_html_url?: string;
        badge_image_url?: string;
        organization?: string;
        event_name?: string;
        attendee_type_name?: string;
        background_color?: string;
        text_color?: string;
        qrcode_url?: string;
      };
    };
  };
}

const BadgePreviewScreen = ({ route }: BadgePreviewScreenProps) => {
  const navigation = useNavigation();
  
  // Add null check to prevent 'Cannot read property attendeeDetails of undefined' error
  const attendeeDetails = route?.params?.attendeeDetails || {
    id: '',
    first_name: '',
    last_name: '',
  };
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Get user ID and printer settings from Redux store
  const currentUserId = useSelector(selectCurrentUserId);
  const { selectedNodePrinter, printStatus } = useSelector((state: any) => state.printers);
  const dispatch = useDispatch<AppDispatch>();
  
  // Initialize the print hook
  const { printDocument, loading: printLoading, error: printError, success: printSuccess } = usePrintDocument();
  
  // Handle closing the printer selection modal
  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  
  // Printer selection state
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filteredPrinters, setFilteredPrinters] = useState<Printer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [loadingPrinter, setLoadingPrinter] = useState(false);
  
  // Fetch printers when modal is opened
  const fetchPrinters = useCallback(async () => {
    setIsLoadingPrinters(true);
    try {
      const printersList = await getNodePrinters();
      const onlinePrinters = printersList.filter((printer: Printer) => printer.state === 'online');
      setPrinters(onlinePrinters);
      setFilteredPrinters(onlinePrinters);
    } catch (error) {
      console.error('Failed to fetch printers:', error);
      Alert.alert('Error', 'Failed to fetch printers. Please try again.');
    } finally {
      setIsLoadingPrinters(false);
      setRefreshing(false);
    }
  }, []);
  
  // Filter printers based on search query
  const filterPrinters = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPrinters(printers);
      return;
    }
    
    const filtered = printers.filter(printer => 
      printer.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPrinters(filtered);
  }, [printers]);
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrinters();
  }, [fetchPrinters]);
  
  // Handle printer selection
  const handleSelectPrinter = useCallback(async (printer: Printer) => {
    try {
      setLoadingPrinter(true);
      await dispatch(selectNodePrinterAsync(printer));
      setIsModalVisible(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to select printer:', error);
      Alert.alert('Error', 'Failed to select printer. Please try again.');
    } finally {
      setLoadingPrinter(false);
    }
  }, [dispatch]);
  
  // Auto-reload printers when modal is opened
  useEffect(() => {
    if (isModalVisible) {
      fetchPrinters();
    }
  }, [isModalVisible, fetchPrinters]);
  
  // Force image reload when URL changes
  const [imageTimestamp, setImageTimestamp] = useState<string>('');

  // Load badge preview when attendee details change
  useEffect(() => {
    if (attendeeDetails?.badge_image_url) {
      setIsLoading(true);
      setLoadError(false);
      // Generate new timestamp only when URL changes
      setImageTimestamp(Date.now().toString());
    }
  }, [attendeeDetails?.badge_image_url]);

  // Effect to handle print status changes
  useEffect(() => {
    // Update isPrinting based on printLoading state
    setIsPrinting(printLoading);
    
    // Show error alert if print fails
    if (printError) {
      Alert.alert('Print Error', printError);
    }
  }, [printLoading, printError, printSuccess]);

  // Get all available URLs
  const badgePdfUrl = attendeeDetails.badge_pdf_url;
  const badgeImageUrl = attendeeDetails.badge_image_url;
  
  // Keep other URLs as fallbacks
  const badgeUrl = attendeeDetails.badge_pdf_url || 
                  attendeeDetails.badge_html_url || 
                  attendeeDetails.badge_image_url;
  
  const attendeeName = `${attendeeDetails.first_name} ${attendeeDetails.last_name}`;
  
  const handleGoBack = () => {
    // Navigate to CreateAttendeeScreen instead of going back
    navigation.navigate('CreateAttendee');
  };
  
  const handlePrint = async () => {
    if (!badgePdfUrl) {
      Alert.alert('Error', 'No badge PDF available to print');
      return;
    }
    
    if (!selectedNodePrinter) {
      Alert.alert('No Printer Selected', 'Please select a printer using the dropdown in the top right corner.');
      return;
    }
    
    try {
      setIsPrinting(true);
      
      // Use the printDocument hook to handle the printing
      // This will handle fetching the document, converting to base64, and sending to the printer
      await printDocument(badgePdfUrl, selectedNodePrinter.id);
      
      setIsPrinting(false);
      
      // Create a reference to store the timer ID
      const autoCloseTimerRef = { current: null as NodeJS.Timeout | null };
      
      // Show alert with confirmation button
      Alert.alert(
        'Print Job Sent', 
        `The badge has been sent to the printer (${selectedNodePrinter.name}).`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear the auto-close timer when user presses OK
              if (autoCloseTimerRef.current) {
                clearTimeout(autoCloseTimerRef.current);
              }
              navigation.navigate('CreateAttendee');
            }
          }
        ],
        { cancelable: false } // Prevent dismissing by tapping outside
      );
      
      // Set a timeout to automatically navigate after 10 seconds
      autoCloseTimerRef.current = setTimeout(() => {
        // Navigate to CreateAttendee screen after timeout
        console.log('Auto-closing print confirmation after 10 seconds');
        navigation.navigate('CreateAttendee');
      }, 10000); // 10 seconds
    } catch (error) {
      setIsPrinting(false);
      console.error('Print error:', error);
      Alert.alert('Print Error', 'Failed to print the badge. Please try again.');
    }
  };
  
  const handleModify = () => {
    // Navigate to the modify attendee screen with attendee details
    navigation.navigate('ModifyAttendee', { attendeeDetails });
  };
  
  const handleRegenerate = async () => {
    try {
      // Show loading indicator
      setIsLoading(true);
      
      // Include required fields along with the regenerate parameter
      const regenerateParams: any = {
        current_user_login_details_id: currentUserId || '',
        attendee_id: attendeeDetails.id,
        // Required fields from the API
        first_name: attendeeDetails.first_name,
        last_name: attendeeDetails.last_name,
        // Use a default email if not available in attendee details
        email: 'attendee@example.com', // Default fallback email
        // The main parameter we need - generate a new badge
        generate_badge: 1
      };
      
      // Update the email if it exists in the attendee details
      if ('email' in attendeeDetails && typeof attendeeDetails.email === 'string') {
        regenerateParams.email = attendeeDetails.email;
      }
      
      console.log('Regenerating badge with params:', regenerateParams);
      
      // Call the update API with just the regenerate parameter
      const response = await updateAttendee(regenerateParams);
      
      console.log('Badge regenerated successfully:', response);
      
      // Extract updated attendee details from the response
      const updatedAttendeeDetails = response?.attendee_details || response?.data?.attendee_details;
      
      // Hide loading indicator
      setIsLoading(false);
      
      if (updatedAttendeeDetails && Object.keys(updatedAttendeeDetails).length > 0) {
        // Update the local state directly instead of navigation
        const updatedDetails = {
          ...attendeeDetails,
          ...updatedAttendeeDetails,
          badge_image_url: updatedAttendeeDetails.badge_image_url + '?t=' + Date.now()
        };
        
        // Force a re-render with new details
        navigation.replace('BadgePreview', { attendeeDetails: updatedDetails });
        
        Alert.alert('Success', 'Badge has been regenerated successfully');
      } else {
        Alert.alert('Error', 'Failed to regenerate badge. Please try again.');
      }
    } catch (error) {
      console.error('Failed to regenerate badge:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to regenerate badge. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={[globalStyle.container, styles.container]}>
      <MainHeader 
        title="Badge Preview" 
        showBackButton={true} 
        onLeftPress={handleGoBack}
      />
      
      {/* Printer toolbar */}
      <View style={styles.toolbarContainer}>
        <View style={styles.printerSelectorWrapper}>
          <Text style={styles.printerSelectorLabel}>Select Printer:</Text>
          <View style={styles.printerDropdown}>
            <TouchableOpacity 
              style={styles.printerButton}
              onPress={() => {
                setIsModalVisible(true);
                fetchPrinters(); // Fetch printers when opening modal
              }}
            >
              <Text style={styles.printerButtonText}>
                {selectedNodePrinter ? selectedNodePrinter.name : 'No printer selected'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Printer selection modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Printer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Custom printer list implementation */}
            <View style={styles.printerListContainer}>
              <Spinner
                visible={isLoadingPrinters || loadingPrinter}
                textContent="Loading..."
              />
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Search
                  value={searchQuery}
                  onChange={filterPrinters}
                  placeholder="Search printers..."
                />
              </View>
              
              {isLoadingPrinters ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading printers...</Text>
                </View>
              ) : filteredPrinters.length > 0 ? (
                <FlatList
                  data={filteredPrinters}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.printerItem, selectedNodePrinter?.id === item.id && styles.selectedPrinterItem]}
                      onPress={() => handleSelectPrinter(item)}
                    >
                      <Text style={[styles.printerItemText, selectedNodePrinter?.id === item.id && styles.selectedPrinterItemText]}>
                        {item.name}
                      </Text>
                      {selectedNodePrinter?.id === item.id && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.printersList}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[colors.primary]}
                      tintColor={colors.primary}
                    />
                  }
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No printers available</Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchPrinters}
                  >
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={styles.previewContainer}>
        <View style={styles.badgeContainer}>
          {/* Display badge info */}
          <View style={styles.badgeInfoContainer}>
            <Text style={styles.badgeInfoTitle}>Badge Information</Text>
            
            {/* Custom badge preview */}
            <View style={styles.customBadgeContainer}>
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContentContainer}
                maximumZoomScale={3.0}
                minimumZoomScale={1.0}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                {/* If we have an image URL, display it with zoom capability */}
                {badgeImageUrl ? (
                  <PinchZoomView style={styles.zoomContainer}>
                    <Image 
                      key={imageTimestamp} // Force reload when URL or timestamp changes
                      source={{ uri: `${badgeImageUrl}?t=${imageTimestamp}` }} // Use stable timestamp
                      style={styles.badgeImage}
                      resizeMode="contain"
                      onLoadStart={() => setIsLoading(true)}
                      onLoadEnd={() => setIsLoading(false)}
                      onError={(error) => {
                        console.error('Badge image load error:', error);
                        setIsLoading(false);
                        setLoadError(true);
                      }}
                    />
                    {isLoading && (
                      <View style={styles.badgeLoadingContainer}>
                        <ActivityIndicator size="large" color={colors.green} />
                        <Text style={styles.badgeLoadingText}>Loading badge...</Text>
                      </View>
                    )}
                  </PinchZoomView>
                ) : (
                  <View style={styles.customBadge}>
                    <View style={styles.badgeHeader}>
                      <Text style={styles.eventTitle}>{attendeeDetails.event_name || 'Event'}</Text>
                    </View>
                    
                    <View style={styles.badgeContent}>
                      <Text style={styles.badgeName}>{attendeeName}</Text>
                      <Text style={styles.badgeOrg}>{attendeeDetails.organization || ''}</Text>
                      
                      {attendeeDetails.attendee_type_name && (
                        <View 
                          style={[styles.badgeType, { 
                            backgroundColor: attendeeDetails.background_color || '#f0f0f0',
                          }]}
                        >
                          <Text style={[styles.badgeTypeText, {
                            color: attendeeDetails.text_color || '#000000'
                          }]}>
                            {attendeeDetails.attendee_type_name}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.badgeFooter}>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
            

          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.black }, !selectedNodePrinter && styles.disabledButton]}
          onPress={selectedNodePrinter ? handlePrint : () => Alert.alert('No Printer Selected', 'Please select a printer first')}
          disabled={isPrinting}
        >
          {isPrinting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.actionButtonText}>
              {selectedNodePrinter ? 'Print' : 'Select Printer'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={handleModify}
        >
          <Text style={styles.actionButtonText}>Modify</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleRegenerate}
        >
          <Text style={styles.actionButtonText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    width: '100%',
    maxWidth: '100%',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
    margin: 10,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeContainer: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInfoContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    alignItems: 'center',
  },
  badgeInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 15,
  },
  badgeInfoText: {
    fontSize: 16,
    color: colors.dark,
    marginBottom: 8,
  },
  customBadgeContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  scrollContainer: {
    width: '100%',
    height: 500, // Increased height
    marginVertical: 10,
  },
  scrollContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },
  zoomContainer: {
    width: Dimensions.get('window').width * 0.9,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  customBadge: {
    width: 300,
    height: 450,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeHeader: {
    backgroundColor: colors.primary,
    padding: 15,
    alignItems: 'center',
  },
  eventTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  badgeOrg: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.grey,
  },
  badgeType: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeFooter: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    alignItems: 'center',
  },
  badgeId: {
    fontSize: 14,
    color: colors.grey,
  },
  badgeLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  badgeImagePlaceholder: {
    width: 250,
    height: 350,
    backgroundColor: colors.light,
    borderRadius: 8,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  badgeImageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  badgeImageSubtext: {
    fontSize: 16,
    color: colors.dark,
    marginTop: 10,
  },

  // Loading text styles
  badgeLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.dark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    padding: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButton: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28%',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.grey,
    opacity: 0.7,
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    width: '100%',
  },
  printerSelectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printerSelectorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
    marginRight: 8,
  },
  printerDropdown: {
    width: 200,
  },
  printerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  printerButtonText: {
    fontSize: 14,
    color: colors.dark,
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 12,
    color: colors.dark,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  printerListContainer: {
    flex: 1,
    width: '100%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.dark,
  },
  printersList: {
    padding: 10,
  },
  printerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  selectedPrinterItem: {
    backgroundColor: colors.primary,
  },
  printerItemText: {
    fontSize: 16,
    color: colors.dark,
  },
  selectedPrinterItemText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  checkIcon: {
    fontSize: 18,
    color: colors.white,
    marginLeft: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.dark,
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.dark,
  },

});

export default BadgePreviewScreen;
