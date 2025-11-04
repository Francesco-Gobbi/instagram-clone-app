import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import { COLORS } from '../../utils/usePalete';

const BottomMenu = ({
  visible,
  onClose,
  onReport,
  onEdit,
  onBlock,
  showEdit = false,
  reportLabel = 'Segnala',
  editLabel = 'Modifica',
  blockLabel = 'Blocca utente',
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.sheetContainer} 
          activeOpacity={1} 
          onPress={e => e.stopPropagation()}
        >
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              onClose && onClose();
              onReport && onReport();
            }}
          >
            <Text style={styles.sheetButtonText}>{reportLabel}</Text>
          </TouchableOpacity>

          <View style={styles.sheetDivider} />

          {showEdit && (
            <>
              <TouchableOpacity
                style={styles.sheetButton}
                onPress={() => {
                  onClose && onClose();
                  onEdit && onEdit();
                }}
              >
                <Text style={styles.sheetButtonText}>{editLabel}</Text>
              </TouchableOpacity>
              <View style={styles.sheetDivider} />
            </>
          )}

          <TouchableOpacity
            style={[styles.sheetButton, { marginBottom: 6 }]}
            onPress={() => {
              Alert.alert(
                'Blocca utente',
                'Sei sicuro di voler bloccare questo utente? Non vedrai più i suoi post e storie.',
                [
                  {
                    text: 'Annulla',
                    style: 'cancel',
                  },
                  {
                    text: 'Blocca',
                    style: 'destructive',
                    onPress: () => {
                      onClose && onClose();
                      onBlock && onBlock();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={[styles.sheetButtonText, { color: '#FF3250' }]}>{blockLabel}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default BottomMenu;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '92%',
    alignSelf: 'center',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  sheetButton: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 16,
    marginVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  sheetDivider: {
    width: '90%',
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
    alignSelf: 'center',
    opacity: 0.5,
  },
});
