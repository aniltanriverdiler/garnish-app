import { Text, TouchableOpacity, Image, Platform } from 'react-native';
import type { Product } from '@garnish/shared';
import { router } from 'expo-router';

const MenuCard = ({ item }: { item: Product }) => {
  const { id, name, image, price } = item;

  return (
    <TouchableOpacity
      className="menu-card"
      style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787' } : {}}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id } })}>
      <Image
        source={{ uri: image }}
        className="absolute -top-10 size-32 rounded-lg"
        resizeMode="contain"
      />
      <Text className="base-bold mb-2 text-center text-dark-100" numberOfLines={1}>
        {name}
      </Text>
      <Text className="body-regular mb-4 font-quicksand-bold text-gray-200">From ${price}</Text>
      <TouchableOpacity>
        <Text className="paragraph-bold text-primary">+ Add to cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
