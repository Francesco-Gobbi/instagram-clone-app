import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const reportReasons = [
  'Spam',
  'Nudity or sexual activity',
  'Hate speech or symbols',
  'Bullying or harassment',
  'False information',
  'Scam or fraud',
  'Intellectual property violation',
  'I just don\'t like it',
];

const ReportModal = ({ visible, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState(null);

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Report</Text>
          <Text style={styles.subtitle}>Why are you reporting this?</Text>
          {reportReasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.reasonButton}
              onPress={() => setSelectedReason(reason)}
            >
              <Text style={styles.reasonText}>{reason}</Text>
              {selectedReason === reason && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#232325',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  reasonText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginLeft: 'auto',
  },
  submitButton: {
    backgroundColor: '#f00',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
  },
});

export default ReportModal;
