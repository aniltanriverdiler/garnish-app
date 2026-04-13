import { images } from '@/constants';
import { Redirect, Slot } from 'expo-router';
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

export default function AuthLayout() {
  const isAuthenticated = false;

  if (isAuthenticated) return <Redirect href="/" />

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="h-full bg-white" keyboardShouldPersistTaps="handled">
        <View
          className="relative w-full"
          style={{ height: Dimensions.get('screen').height / 2.25 }}>
          <ImageBackground
            source={images.loginGraphic}
            className="size-full rounded-b-lg"
            resizeMode="stretch"
          />
          <Image source={images.logo} className="absolute -bottom-16 z-10 size-48 self-center" />
        </View>
        <Slot />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
