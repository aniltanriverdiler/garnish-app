import { useRouter } from 'expo-router';
import { Image, TouchableOpacity, View } from 'react-native';

import { images } from '@/constants';
import { CustomHeaderProps } from '@/types';

const CustomHeader = ({ title }: CustomHeaderProps) => {
  const router = useRouter();

  return (
    <View className="custom-header">
      <TouchableOpacity onPress={() => router.navigate('/search')}>
        <Image source={images.arrowBack} className="size-7" resizeMode="contain" />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image source={images.search} className="size-7" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;
