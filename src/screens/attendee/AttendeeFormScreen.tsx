import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '../../navigation/SimpleNavigator';
import { selectSelectedEvent } from '../../redux/selectors/events/eventsSelectors';
import { selectCurrentUserId } from '../../redux/selectors/auth/authSelectors';
import colors from '../../assets/colors/colors';
import globalStyle from '../../assets/styles/globalStyle';
import MainHeader from '../../components/elements/header/MainHeader';
import { fetchAttendeeTypes, addAttendee, AttendeeType } from '../../services/attendeeService';

interface AttendeeFormData {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  attendeeTypeId: string;
}

const AttendeeFormScreen = () => {
  const navigation = useNavigation();
  const selectedEvent = useSelector(selectSelectedEvent);
  const currentUserId = useSelector(selectCurrentUserId);
  
  // Form state
  const [formData, setFormData] = useState<AttendeeFormData>({
    firstName: '',
    lastName: '',
    organization: '',
    email: '',
    attendeeTypeId: ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Partial<AttendeeFormData>>({});
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  
  // Attendee types
  const [attendeeTypes, setAttendeeTypes] = useState<AttendeeType[]>([]);
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Fetch attendee types on component mount
  useEffect(() => {
    const loadAttendeeTypes = async () => {
      if (!currentUserId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }
      
      setIsLoadingTypes(true);
      try {
        const types = await fetchAttendeeTypes(currentUserId);
        setAttendeeTypes(types);
        
        // Set default attendee type if available
        if (types.length > 0) {
          setFormData(prev => ({ ...prev, attendeeTypeId: types[0].id }));
        }
      } catch (error) {
        console.error('Failed to load attendee types:', error);
        Alert.alert('Error', 'Failed to load attendee types');
      } finally {
        setIsLoadingTypes(false);
      }
    };
    
    loadAttendeeTypes();
  }, [currentUserId]);
  
  const validateForm = (): boolean => {
    const newErrors: Partial<AttendeeFormData> = {};
    
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate attendee type
    if (!formData.attendeeTypeId) {
      newErrors.attendeeTypeId = 'Attendee type is required';
    }
    
    // Update errors state
    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (!currentUserId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    
    // Get event information
    const emsSecretCode = selectedEvent?.ems_secret_code;
    const eventId = selectedEvent?.event_id || selectedEvent?.id;
    
    console.log('Selected event:', selectedEvent);
    console.log('Event secret code:', emsSecretCode);
    console.log('Event ID:', eventId);
    
    if (!emsSecretCode) {
      Alert.alert('Error', 'Event secret code not found');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log all the parameters being sent
      const attendeeParams = {
        current_user_login_details_id: currentUserId,
        ems_secret_code: emsSecretCode,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        organization: formData.organization || '',
        attendee_type_id: formData.attendeeTypeId,
        // Match the exact format used in the working implementation
        status_id: 2, // Approved
        attendee_status: 1, // Checked in
        generate_badge: 1,
        send_confirmation_mail_ems_yn: 0,
        send_badge_yn: 0,
        send_badge_item: ''
      };
      
      console.log('Sending attendee data:', attendeeParams);
      
      const response = await addAttendee(attendeeParams);
      
      console.log('Attendee added successfully:', response);
      
      // Extract attendee details from the response
      const attendeeDetails = response?.attendee_details;
      
      // Log the attendee details for debugging
      console.log('Attendee details from response:', attendeeDetails);
      
      if (attendeeDetails && Object.keys(attendeeDetails).length > 0) {
        // Navigate to badge preview screen with the attendee details
        console.log('Navigating to badge preview with:', { attendeeDetails });
        navigation.navigate('BadgePreview', { attendeeDetails });
      } else {
        // Show success message if no attendee details are available
        Alert.alert(
          'Success',
          'Attendee has been added successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Failed to add attendee:', error);
      
      // Display more specific error message if available
      const errorMessage = error.message || 'Failed to add attendee';
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'OK'
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get event name for header
  const eventName = selectedEvent ? 
    (selectedEvent.event_name || selectedEvent.title || 'Event') : 
    'Event';
  
  // If loading attendee types, show loading indicator
  if (isLoadingTypes) {
    return (
      <SafeAreaView style={[globalStyle.container, styles.container]}>
        <MainHeader 
          title={`Add Attendee - ${eventName}`}
          onLeftPress={handleGoBack}
          showBackButton
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={styles.loadingText}>Loading attendee types...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[globalStyle.container, styles.container]}>
      {/* Header with event name and back button */}
      <MainHeader 
        title={`Add Attendee - ${eventName}`}
        onLeftPress={handleGoBack}
        showBackButton
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form fields */}
          <View style={styles.formContainer}>
            {/* Attendee Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Attendee Type *</Text>
              <CustomDropdown
                data={attendeeTypes}
                value={formData.attendeeTypeId}
                onSelect={(id: string) => setFormData({...formData, attendeeTypeId: id})}
                error={errors.attendeeTypeId}
              />
            </View>
            
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                placeholder="Enter first name"
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
              />
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>
            
            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
                placeholder="Enter last name"
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>
            
            {/* Organization */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Organization</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter organization"
                value={formData.organization}
                onChangeText={(text) => setFormData({...formData, organization: text})}
              />
            </View>
            
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Enter email"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting ? styles.disabledButton : null]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Custom Dropdown Component
interface CustomDropdownProps {
  data: AttendeeType[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
}

const CustomDropdown = ({ data, value, onSelect, error }: CustomDropdownProps) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<AttendeeType[]>(data);
  
  // Find the selected item to display its name
  const selectedItem = data.find(item => item.id === value);
  
  // Filter data based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);
  
  // Reset search when modal is closed
  const handleClose = () => {
    setVisible(false);
    setSearchQuery('');
  };
  
  return (
    <View>
      <TouchableOpacity 
        style={[styles.input, error ? styles.inputError : null, styles.dropdownButton]}
        onPress={() => setVisible(true)}
      >
        <Text style={selectedItem ? styles.dropdownSelectedText : styles.dropdownPlaceholderText}>
          {selectedItem ? selectedItem.name : 'Select attendee type'}
        </Text>
      </TouchableOpacity>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Select Attendee Type</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search attendee types..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.listContainer}>
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.dropdownItem, item.id === value ? styles.dropdownItemSelected : null]}
                    onPress={() => {
                      onSelect(item.id);
                      handleClose();
                    }}
                  >
                    <View style={styles.dropdownItemContent}>
                      <Text style={styles.dropdownItemText}>{item.name}</Text>
                      <View 
                        style={[styles.colorIndicator, { 
                          backgroundColor: item.background_color || colors.light,
                          borderColor: item.text_color || colors.dark
                        }]}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListText}>No matching attendee types found</Text>
                  </View>
                }
                contentContainerStyle={styles.flatListContentContainer}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    width: '100%',
    maxWidth: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.dark,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: colors.green,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
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
  dropdownButton: {
    justifyContent: 'center',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: colors.dark,
  },
  dropdownPlaceholderText: {
    fontSize: 16,
    color: colors.grey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  dropdownItemSelected: {
    backgroundColor: colors.light,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.dark,
    flex: 1,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 10,
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: colors.grey,
  },
  listContainer: {
    flex: 1,
  },
  flatListContentContainer: {
    flexGrow: 1,
  },
});

export default AttendeeFormScreen;
