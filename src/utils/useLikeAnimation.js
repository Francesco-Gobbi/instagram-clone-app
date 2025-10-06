import {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withDelay,
    Easing,
    runOnJS,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import useHandleLike from '../hooks/useHandleLike';

const STAR_CONFIGS = [
    { x: -18, y: -16 },
    { x: 0, y: -30 },
    { x: 18, y: -16 },
];

const useLikeAnimation = (post, currentUser, options = {}) => {
    const { handlePostLike } = useHandleLike();

    const { iconSize = 72, starOffsets = STAR_CONFIGS } = options;

    const thumbOpacity = useSharedValue(0);
    const thumbScale = useSharedValue(0);
    const thumbRotation = useSharedValue(0);
    const thumbTranslateX = useSharedValue(0);
    const thumbTranslateY = useSharedValue(0);
    const thumbFlickTranslateY = useSharedValue(0);

    const stars = starOffsets.map(() => ({
        opacity: useSharedValue(0),
        scale: useSharedValue(0),
    }));

    const doubleTapHandleLike = () => {
        if (!post.likes_by_users.includes(currentUser.email)) {
            handlePostLike(post, currentUser);
        }
    };

    const handleDoubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart((event) => {
            runOnJS(doubleTapHandleLike)();

            const halfIcon = iconSize / 2;

            thumbTranslateX.value = withTiming(event.x - halfIcon, { duration: 0 });
            thumbTranslateY.value = withTiming(event.y - halfIcon, { duration: 0 });
            thumbFlickTranslateY.value = withTiming(0, { duration: 0 });

            thumbOpacity.value = withSequence(
                withTiming(1, { duration: 220 }),
                withDelay(900, withTiming(0, { duration: 240 }))
            );

            thumbScale.value = withSequence(
                withTiming(1.18, {
                    duration: 260,
                    easing: Easing.out(Easing.back(1.4)),
                }),
                withTiming(1, {
                    duration: 200,
                    easing: Easing.out(Easing.cubic),
                }),
                withDelay(520, withTiming(0.6, { duration: 180 })),
                withTiming(0, { duration: 160 })
            );

            thumbRotation.value = withSequence(
                withTiming(-18, {
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                }),
                withTiming(14, {
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                }),
                withTiming(-10, {
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                }),
                withTiming(6, { duration: 150 }),
                withDelay(280, withTiming(0, { duration: 240 }))
            );

            thumbFlickTranslateY.value = withSequence(
                withTiming(-26, {
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                }),
                withTiming(16, {
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                }),
                withTiming(-8, {
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                }),
                withDelay(320, withTiming(0, { duration: 260 }))
            );

            stars.forEach((star, index) => {
                const starDelay = 320 + index * 120;

                star.opacity.value = withDelay(
                    starDelay,
                    withSequence(
                        withTiming(1, { duration: 220 }),
                        withDelay(240, withTiming(0, { duration: 280 }))
                    )
                );

                star.scale.value = withDelay(
                    starDelay,
                    withSequence(
                        withTiming(1.4, {
                            duration: 260,
                            easing: Easing.out(Easing.back(1.6)),
                        }),
                        withTiming(0.9, { duration: 200 }),
                        withTiming(0, { duration: 200 })
                    )
                );
            });
        });

    const animatedStyles = useAnimatedStyle(() => ({
        opacity: thumbOpacity.value,
        transform: [
            { scale: thumbScale.value },
            { rotateZ: `${thumbRotation.value}deg` },
            { translateY: thumbTranslateY.value + thumbFlickTranslateY.value },
            { translateX: thumbTranslateX.value },
        ],
    }));

    const starStyles = stars.map((star, index) =>
        useAnimatedStyle(() => ({
            opacity: star.opacity.value,
            transform: [
                { scale: star.scale.value },
                { translateY: thumbTranslateY.value + thumbFlickTranslateY.value + starOffsets[index].y },
                { translateX: thumbTranslateX.value + starOffsets[index].x },
            ],
        }))
    );

    return { handleDoubleTap, animatedStyles, starStyles };
}

export default useLikeAnimation
