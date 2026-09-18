import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

cssInterop(BlurView, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

// Do not cssInterop Reanimated components — className + useAnimatedStyle causes ReanimatedError.
