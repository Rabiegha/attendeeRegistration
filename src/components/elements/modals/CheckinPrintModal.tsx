import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from 'react-native';
import LottieView from 'lottie-react-native';
import colors from '../../../assets/colors/colors';
import Icons from '../../../assets/images/icons';
import { printStatusConfig } from '../../../printing/constants/printStatusConfig';

type Props = {
  visible: boolean;
  status: keyof typeof printStatusConfig | null;
  onClose: () => void;
};

const CheckinPrintModal = ({ visible, status, onClose }: Props) => {
  // Don't render anything if not visible or no status
  if (!visible || !status) return null;

  const config = status ? printStatusConfig[status] : undefined;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.headerContainer}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Image source={Icons.Fermer} style={styles.closeIcon} />
                </TouchableOpacity>
                <Text style={styles.text}>{config?.message}</Text>
              </View>
              <LottieView
                source={config?.animation}
                autoPlay
                loop={config?.loop}
                style={[styles.animation, { height: config?.height }]}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 10,
  },
  text: {
    width: '100%',
    color: colors.dark,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 30, // Add padding to make room for the close button
  },
  closeButton: {
    position: 'absolute',
    top: -2, // Adjust to align with the text vertically
    right: 0,
    zIndex: 10,
    padding: 5,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: colors.dark,
  },
  animation: {
    width: '100%',
  },
});

export default CheckinPrintModal;
