import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { selectNodePrinterAsync, Printer } from '../../redux/slices/printerSlice';
import { getNodePrinters } from '../../services/printNodeService';
import colors from '../../assets/colors/colors';
import Icons from '../../assets/images/icons';

interface PrinterSelectorProps {
  onPrinterSelected?: (printer: Printer) => void;
}

const PrinterSelector = ({ onPrinterSelected }: PrinterSelectorProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedPrinter = useSelector((state: any) => state.printers.selectedNodePrinter);
  const dispatch = useDispatch<AppDispatch>();

  const fetchPrinters = useCallback(async () => {
    setIsLoading(true);
    try {
      const printersList = await getNodePrinters();
      setPrinters(printersList.filter((printer: Printer) => printer.state === 'online'));
    } catch (error) {
      console.error('Failed to fetch printers:', error);
      Alert.alert('Error', 'Failed to fetch printers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      fetchPrinters();
    }
  }, [isModalVisible, fetchPrinters]);

  const handleSelectPrinter = async (printer: Printer) => {
    try {
      await dispatch(selectNodePrinterAsync(printer));
      if (onPrinterSelected) {
        onPrinterSelected(printer);
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to select printer:', error);
      Alert.alert('Error', 'Failed to select printer. Please try again.');
    }
  };

  const renderPrinterItem = ({ item }: { item: Printer }) => (
    <TouchableOpacity
      style={[
        styles.printerItem,
        selectedPrinter?.id === item.id && styles.selectedPrinterItem
      ]}
      onPress={() => handleSelectPrinter(item)}
    >
      <Text style={[
        styles.printerName,
        selectedPrinter?.id === item.id && styles.selectedPrinterText
      ]}>
        {item.name}
      </Text>
      {selectedPrinter?.id === item.id && (
        <View style={styles.checkIcon}>
          <Icons.Checked width={16} height={16} fill={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {selectedPrinter ? selectedPrinter.name : 'Select Printer'}
        </Text>
        <Icons.Filtre width={16} height={16} fill={colors.dark} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Printer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Icons.Fermer width={20} height={20} fill={colors.dark} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading printers...</Text>
              </View>
            ) : printers.length > 0 ? (
              <FlatList
                data={printers}
                renderItem={renderPrinterItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.printersList}
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
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectorText: {
    fontSize: 14,
    color: colors.dark,
    marginRight: 8,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
  printerName: {
    fontSize: 16,
    color: colors.dark,
  },
  selectedPrinterText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  checkIcon: {
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
});

export default PrinterSelector;
