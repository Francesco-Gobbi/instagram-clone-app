import {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";

const useOpacityAnimation = () => {
    const scrollY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 900], [1, 0], Extrapolation.CLAMP);

        return {
            opacity,
        };
    });

    return {
        scrollY,
        animatedStyle
    }
}

export default useOpacityAnimation