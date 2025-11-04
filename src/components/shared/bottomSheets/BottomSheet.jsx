import { StyleSheet, View } from 'react-native';
import React, { useCallback } from 'react';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';

const BottomSheet = ({
  bottomSheetRef,
  snapPoints,
  children,
  onDismiss,
  backgroundStyle,
  handleStyle,
  backdropOpacity = 0.7,
}) => {
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={backdropOpacity}
        pressBehavior="close"
        enableTouchThrough={false}
      />
    ),
    [backdropOpacity]
  );

  return (
    <Portal>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={(index) => {
          if (index === -1 && onDismiss) {
            onDismiss();
          }
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={[styles.indicator, handleStyle]}
        backgroundStyle={[styles.background, backgroundStyle]}
      >
        <View style={styles.contentContainer}>{children}</View>
      </BottomSheetModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#232325',
    borderRadius: 25,
  },
  contentContainer: {
    flex: 1,
  },
  indicator: {
    backgroundColor: '#777',
    width: 40,
    height: 4,
    marginTop: 8,
  },
});

export default BottomSheet;