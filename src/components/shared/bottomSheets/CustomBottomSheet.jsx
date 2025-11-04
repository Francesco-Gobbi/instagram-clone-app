import { StyleSheet, View } from 'react-native';
import React, { useCallback } from 'react';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';

const CustomBottomSheet = ({ 
  bottomSheetRef, 
  snapPoints, 
  children, 
  onChange,
  backdropOpacity = 0.5 
}) => {
  // Gestione del backdrop
  const renderBackdrop = useCallback(props => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={backdropOpacity}
      pressBehavior="close"
    />
  ), [backdropOpacity]);

  // Chiudi il bottomsheet quando la schermata perde il focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        bottomSheetRef.current?.dismiss();
      };
    }, [])
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={onChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
      enablePanDownToClose
      enableDismissOnClose
    >
      <View style={styles.contentContainer}>
        {children}
      </View>
    </BottomSheetModal>
  );
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#232325',
    borderRadius: 25,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  indicator: {
    backgroundColor: '#777',
    width: 40,
    height: 4,
    marginTop: 9,
  },
});