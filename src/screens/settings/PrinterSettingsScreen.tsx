import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '../../navigation/SimpleNavigator';
import { useSelector, useDispatch } from 'react-redux';
import colors from '../../assets/colors/colors';
import globalStyle from '../../assets/styles/globalStyle';
import MainHeader from '../../components/elements/header/MainHeader';
import PrintersList from '../../components/screens/settings/PrintersListComponent';
import Icons from '../../assets/images/icons';
import {
  setHighQuality,
  setPrintStatus
} from '../../redux/slices/printerSlice';

const PrinterSettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Get printer settings from Redux store
  const { 
    highQuality,
    selectedNodePrinter,
    printStatus: printerStatusText
  } = useSelector((state: any) => state.printers);
  
  // State for refresh function
  const [refreshPrinters, setRefreshPrinters] = useState<(() => void) | null>(null);
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Callback to receive the refresh function from the child component
  const handleRefreshCallback = useCallback((refreshFunction: () => void) => {
    setRefreshPrinters(() => refreshFunction);
  }, []);
  
  // Handler for the refresh button
  const handleRefreshPress = () => {
    if (refreshPrinters) {
      refreshPrinters();
    }
  };
  
  
  
  // Toggle high quality state
  const handleToggleHighQuality = (value: boolean) => {
    dispatch(setHighQuality(value));
  };
  
  // Handle test print
  const handleTestPrint = () => {
    if (!selectedNodePrinter) {
      Alert.alert('No Printer Selected', 'Please select a printer first.');
      return;
    }
    
    // Simple test print implementation
    dispatch(setPrintStatus('Sending test print...'));
    
    // Simulate print job
    setTimeout(() => {
      dispatch(setPrintStatus('Test print sent successfully!'));
      Alert.alert('Success', `Test print sent to ${selectedNodePrinter.name}`);
    }, 2000);
  };
  
  return (
    <SafeAreaView style={[globalStyle.container, styles.container]}>
      <MainHeader 
        title="Printer Settings"
        onLeftPress={handleGoBack}
        onRightPress={handleRefreshPress}
        rightIcon={Icons.refresh}
        showBackButton
      />
      
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Printer Configuration</Text>
          


          {/* Print Quality */}
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>
                High Quality Printing
              </Text>
              <Text style={styles.settingDescription}>
                Use higher resolution for better quality (slower)
              </Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGrey, true: colors.green }}
              thumbColor={highQuality ? colors.green : colors.grey}
              onValueChange={handleToggleHighQuality}
              value={highQuality}
            />
          </View>
          
          {/* Printer Selection Section */}
          <View style={styles.printerSection}>
            <Text style={styles.sectionTitle}>
              Select Printer
            </Text>
            <Text style={[styles.settingDescription, styles.marginBottom]}>
              {selectedNodePrinter ? 
                `Selected: ${selectedNodePrinter.name}` : 
                'No printer selected'}
            </Text>
            
            <View style={styles.printerListContainer}>
              <PrintersList 
                refreshCallback={handleRefreshCallback}
              />
            </View>
          </View>
          
          {/* Test Print Button */}
          <TouchableOpacity 
            style={[
              styles.testPrintButton, 
              !selectedNodePrinter && styles.disabledButton
            ]}
            disabled={!selectedNodePrinter}
            onPress={handleTestPrint}
          >
            <Text style={[
              styles.testPrintButtonText,
              !selectedNodePrinter && styles.disabledButtonText
            ]}>
              Test Print
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    maxWidth: '100%',  // Ensure full width on tablets
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    padding: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    width: '100%',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.grey,
  },
  marginBottom: {
    marginBottom: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.grey,
  },
  printerSection: {
    marginTop: 30,
    width: '100%',
  },
  printerListContainer: {
    height: 300,
    width: '100%',
    marginBottom: 20,
  },
  testPrintButton: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  testPrintButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.lightGrey,
  },
  disabledButtonText: {
    color: colors.grey,
  },
});

export default PrinterSettingsScreen;
