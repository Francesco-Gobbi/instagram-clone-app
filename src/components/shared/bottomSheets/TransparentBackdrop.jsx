
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import React from "react";

const TransparentBackdrop = React.forwardRef((props, ref) => {
  return (
    <BottomSheetBackdrop
      ref={ref}
      {...props}
      appearsOnIndex={[0, 1]}
      disappearsOnIndex={-1}
      pressBehavior={"close"}
      opacity={0.1}
    />
  );
});

export default TransparentBackdrop;
