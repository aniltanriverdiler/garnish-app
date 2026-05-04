import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { images } from '@/constants';
import CustomButton from '@/components/ui/CustomButton';

export default function LoginSuccess() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <Image source={images.success} className="mb-8 h-52 w-52" resizeMode="contain" />

        <Text className="h1-bold mb-3 text-center text-dark-100">Login Successful</Text>

        <Text className="body-regular mb-10 text-center text-gray-200">
          You're all set to continue where you left off.
        </Text>

        <CustomButton title="Go to Homepage" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}
