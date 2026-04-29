import { Text, TouchableOpacity, Image, Platform } from 'react-native';
import { MenuItem } from '@/types';

const MenuCard = ({ item: { id, image, name, price } }: { item: MenuItem }) => {
  return (
    <TouchableOpacity
      className="menu-card"
      style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787' } : {}}>
      <Image source={{ uri: image }} className="absolute -top-10 size-32" resizeMode="contain" />
      <Text className="base-bold mb-2 text-center text-dark-100" numberOfLines={1}>
        {name}
      </Text>
      <Text className="body-regular mb-4 text-gray-200">From ${price}</Text>
      <TouchableOpacity>
        <Text className="paragraph-bold text-primary">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
