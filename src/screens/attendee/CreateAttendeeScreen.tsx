import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  Animated, 
  Dimensions, 
  TouchableWithoutFeedback,
  Image 
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '../../navigation/SimpleNavigator';
import { selectSelectedEvent } from '../../redux/selectors/events/eventsSelectors';
import colors from '../../assets/colors/colors';
import globalStyle from '../../assets/styles/globalStyle';
import MainHeader from '../../components/elements/header/MainHeader';
import Icons from '../../assets/images/icons';

const CreateAttendeeScreen = () => {
  const navigation = useNavigation();
  
  const selectedEvent = useSelector(selectSelectedEvent);
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(Dimensions.get('window').width));
  
  const handleGoBack = () => {
    // Navigate directly to Events screen instead of using goBack
    navigation.navigate('Events');
  };

  const handleCreateAttendee = () => {
    // Navigate to the attendee form screen
    console.log('Navigating to attendee form for event:', selectedEvent?.event_name);
    navigation.navigate('AttendeeForm');
  };
  
  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  };
  
  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setModalVisible(false);
    });
  };
  
  const navigateToPrinterSettings = () => {
    closeModal();
    // Add a small delay to ensure the modal is closed before navigation
    setTimeout(() => {
      navigation.navigate('PrinterSettings');
    }, 300);
  };

  // Get event name from either event_name or title field
  const eventName = selectedEvent ? 
    (selectedEvent.event_name || selectedEvent.title || 'Selected Event') : 
    'Event';
  
  return (
    <SafeAreaView style={[globalStyle.container, styles.container]}>
      {/* Header with event name, back button, and settings button */}
      <MainHeader 
        title={eventName}
        onLeftPress={handleGoBack}
        onRightPress={openModal}
        showBackButton
        rightIcon={Icons.Outils}
      />
      
      <View style={styles.content}>
        {/* Add New Attendee Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateAttendee}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Add New Attendee</Text>
        </TouchableOpacity>
      </View>
      
      {/* Settings Side Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateX: slideAnim }] }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Settings</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={navigateToPrinterSettings}
                >
                  <View style={styles.modalItemIconContainer}>
                    <Image source={Icons.Print} style={styles.modalItemIcon} />
                  </View>
                  <Text style={styles.modalItemText}>Printer Settings</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addButton: {
    backgroundColor: colors.green,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContent: {
    height: '100%',
    width: '70%',
    maxWidth: 300,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    fontSize: 20,
    color: colors.grey,
    padding: 5,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  modalItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalItemIcon: {
    width: 24,
    height: 24,
    tintColor: colors.green,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.dark,
  },
});

export default CreateAttendeeScreen;
