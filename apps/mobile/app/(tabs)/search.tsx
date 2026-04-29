import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Search() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="paragraph-medium text-gray-100">Search</Text>
      </View>
    </SafeAreaView>
  );
}
