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
import { selectCurrentUserId } from '../../redux/selectors/auth/authSelectors';
import colors from '../../assets/colors/colors';
import globalStyle from '../../assets/styles/globalStyle';
import MainHeader from '../../components/elements/header/MainHeader';
import { fetchAttendeeTypes, AttendeeType, UpdateAttendeeParams } from '../../services/attendeeService';

// Add the updateAttendee function import - we'll implement this later
import { updateAttendee } from '../../services/attendeeService';

interface ModifyAttendeeScreenProps {
  route: {
    params: {
      attendeeDetails: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        email_2?: string;
        phone?: string;
        organization?: string;
        designation?: string;
        country?: string;
        no_of_employees?: string;
        attendance_type?: string;
        postal_address?: string;
        comment?: string;
        session?: string;
        is_qrcode?: number;
        is_badge?: number;
        attendee_type_id?: string;
        attendee_type_name?: string;
        event_id?: string;
        event_name?: string;
        badge_pdf_url?: string;
        badge_html_url?: string;
        badge_image_url?: string;
      };
    };
  };
}

interface AttendeeFormData {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  attendeeTypeId: string;
}

const ModifyAttendeeScreen = ({ route }: ModifyAttendeeScreenProps) => {
  const navigation = useNavigation();
  const currentUserId = useSelector(selectCurrentUserId);
  
  // Get attendee details from route params
  const attendeeDetails = route?.params?.attendeeDetails || {
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    organization: '',
  };
  
  // Form state - initialize with attendee details
  const [formData, setFormData] = useState<AttendeeFormData>({
    firstName: attendeeDetails.first_name || '',
    lastName: attendeeDetails.last_name || '',
    organization: attendeeDetails.organization || '',
    email: attendeeDetails.email || '',
    attendeeTypeId: attendeeDetails.attendee_type_id || ''
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
        
        // If we don't have an attendee type ID yet, set the first one as default
        if (!formData.attendeeTypeId && types.length > 0) {
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
  }, [currentUserId, formData.attendeeTypeId]);
  
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
    
    if (!attendeeDetails.id) {
      Alert.alert('Error', 'Attendee ID not found');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare update parameters
      const updateParams: UpdateAttendeeParams = {
        current_user_login_details_id: currentUserId,
        attendee_id: attendeeDetails.id,
        attendee_type_id: formData.attendeeTypeId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        organization: formData.organization || '',
        generate_badge: 1,
        send_badge_yn: 0
      };
      
      console.log('Sending update attendee data:', updateParams);
      
      const response = await updateAttendee(updateParams);
      
      console.log('Attendee updated successfully:', response);
      
      // Extract attendee details from the response
      const updatedAttendeeDetails = response?.attendee_details;
      
      if (updatedAttendeeDetails && Object.keys(updatedAttendeeDetails).length > 0) {
        // Navigate to badge preview screen with the updated attendee details
        console.log('Navigating to badge preview with updated details:', { attendeeDetails: updatedAttendeeDetails });
        navigation.navigate('BadgePreview', { attendeeDetails: updatedAttendeeDetails });
      } else {
        // Show success message if no attendee details are available
        Alert.alert(
          'Success',
          'Attendee has been updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Failed to update attendee:', error);
      
      // Display more specific error message if available
      const errorMessage = error.message || 'Failed to update attendee';
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
  const eventName = attendeeDetails.event_name || 'Event';
  
  // If loading attendee types, show loading indicator
  if (isLoadingTypes) {
    return (
      <SafeAreaView style={[globalStyle.container, styles.container]}>
        <MainHeader 
          title={`Modify Attendee - ${eventName}`}
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
        title={`Modify Attendee - ${eventName}`}
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
                <Text style={styles.submitButtonText}>Update</Text>
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
  
  // Update filtered data when data or search query changes
  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [data, searchQuery]);
  
  // Get selected attendee type name
  const getSelectedName = () => {
    const selected = data.find(item => item.id === value);
    return selected ? selected.name : 'Select Attendee Type';
  };
  
  // Get color for the selected attendee type
  const getSelectedColor = () => {
    const selected = data.find(item => item.id === value);
    return selected ? selected.background_color : '#f0f0f0';
  };
  
  // Reset search when dropdown is closed
  const handleClose = () => {
    setSearchQuery('');
    setVisible(false);
  };
  
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={[
          styles.dropdownButton, 
          error ? styles.dropdownButtonError : null
        ]}
        onPress={() => setVisible(true)}
      >
        <View style={styles.dropdownButtonContent}>
          {value ? (
            <View 
              style={[
                styles.colorIndicator, 
                { backgroundColor: getSelectedColor() }
              ]} 
            />
          ) : null}
          <Text style={styles.dropdownButtonText}>
            {getSelectedName()}
          </Text>
        </View>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      
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
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Attendee Type</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Search input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search attendee types..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
            
            {/* List of attendee types */}
            {filteredData.length > 0 ? (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.id === value && styles.selectedItem
                    ]}
                    onPress={() => {
                      onSelect(item.id);
                      handleClose();
                    }}
                  >
                    <View 
                      style={[
                        styles.colorIndicator, 
                        { backgroundColor: item.background_color }
                      ]} 
                    />
                    <Text 
                      style={[
                        styles.dropdownItemText,
                        item.id === value && styles.selectedItemText
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.id === value && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.dropdownList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No attendee types found</Text>
              </View>
            )}
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
    paddingBottom: 30,
  },
  formContainer: {
    padding: 20,
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
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.dark,
  },
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },
  dropdownButtonError: {
    borderColor: colors.danger,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.dark,
  },
  dropdownIcon: {
    fontSize: 14,
    color: colors.grey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.grey,
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
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  selectedItem: {
    backgroundColor: colors.lightPrimary,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.dark,
    flex: 1,
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  checkIcon: {
    fontSize: 18,
    color: colors.primary,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.grey,
  },
});

export default ModifyAttendeeScreen;
