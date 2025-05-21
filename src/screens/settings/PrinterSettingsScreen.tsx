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
  const handleTestPrint = async () => {
    if (!selectedNodePrinter) {
      Alert.alert('No Printer Selected', 'Please select a printer first.');
      return;
    }
    
    try {
      // Update status
      dispatch(setPrintStatus('Sending test print...'));
      
      // Create a simple test print PDF content (a white page with text)
      const testPrintBase64 = 'JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErlCtfiyuMK5AIAXQ8GFgplbmRzdHJlYW0KZW5kb2JqCjMgMCBvYmoKPDwKL1BhZ2VzIDEgMCBSCi9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9Db3VudCAxCi9LaWRzIFsyIDAgUl0KL1R5cGUgL1BhZ2VzCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9Db250ZW50cyA1IDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUGFyZW50IDEgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9UeXBlIC9QYWdlCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCi9TdWJ0eXBlIC9UeXBlMQovVHlwZSAvRm9udAo+PgplbmRvYmoKNiAwIG9iago8PAovQXV0aG9yIChBdHRlbmRlZSBSZWdpc3RyYXRpb24gQXBwKQovQ3JlYXRpb25EYXRlIChEOjIwMjUwNTIxMTIzMDAwKQovS2V5d29yZHMgKHRlc3QgcHJpbnQpCi9Nb2REYXRlIChEOjIwMjUwNTIxMTIzMDAwKQovUHJvZHVjZXIgKEF0dGVuZGVlIFJlZ2lzdHJhdGlvbiBBcHApCi9TdWJqZWN0ICh0ZXN0IHByaW50KQovVGl0bGUgKFRlc3QgUHJpbnQpCj4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxMzIgMDAwMDAgbiAKMDAwMDAwMDE4OSAwMDAwMCBuIAowMDAwMDAwMDgzIDAwMDAwIG4gCjAwMDAwMDAzMDcgMDAwMDAgbiAKMDAwMDAwMDAwMCAwMDAwMCBuIAowMDAwMDAwNDA1IDAwMDAwIG4gCnRyYWlsZXIKPDwKL0lEIFs8MWVlZmEyZDBlNGY1YjRhZjI2YmY1MTUzMzI2NzlkMzQ+IDwxZWVmYTJkMGU0ZjViNGFmMjZiZjUxNTMzMjY3OWQzND5dCi9JbmZvIDYgMCBSCi9Sb290IDMgMCBSCi9TaXplIDcKPj4Kc3RhcnR4cmVmCjYwNQolJUVPRgo=';
      
      // Import the sendPrintJob function
      const { sendPrintJob } = await import('../../printing/hooks/useNodePrint').then(module => {
        return { sendPrintJob: module.useNodePrint().sendPrintJob };
      });
      
      // Send the test print job
      await sendPrintJob(testPrintBase64, selectedNodePrinter.id);
      
      // Show success message
      dispatch(setPrintStatus('Test print sent successfully!'));
      Alert.alert('Success', `Test print sent to ${selectedNodePrinter.name}`);
    } catch (error) {
      console.error('Test print error:', error);
      dispatch(setPrintStatus('Test print failed'));
      Alert.alert('Error', 'Failed to send test print. Please try again.');
    }
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
