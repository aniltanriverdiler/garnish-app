import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import useCartStore from '@/store/cart-store';
import { images } from '@/constants';

interface CartItemData {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CartItem = ({ item }: { item: CartItemData }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  return (
    <View
      className="cart-item items-center"
      style={Platform.OS === 'android' ? { elevation: 3, shadowColor: '#000' } : {}}>
      {/* Checkbox */}
      <View className="mr-3 size-6 items-center justify-center rounded-md bg-primary">
        <Image source={images.check} className="size-3.5" tintColor="white" resizeMode="contain" />
      </View>

      {/* Product Image */}
      <View className="cart-item__image mr-3">
        <Image source={{ uri: item.image }} className="size-20" resizeMode="contain" />
      </View>

      {/* Info */}
      <View className="flex-1 gap-1">
        <Text className="font-quicksand-bold text-base text-dark-100" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="font-quicksand-bold text-base text-primary">
          ${(item.price * item.quantity).toFixed(2)}
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => decreaseQty(item.id)}>
            <Image source={images.minus} className="size-4" resizeMode="contain" />
          </TouchableOpacity>
          <Text className="font-quicksand-bold text-base text-dark-100">{item.quantity}</Text>
          <TouchableOpacity onPress={() => increaseQty(item.id)}>
            <Image
              source={images.plus}
              className="size-4"
              tintColor="#FE8C00"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity onPress={() => removeItem(item.id)} className="ml-2 p-1">
        <Image source={images.trash} className="size-5" tintColor="#F14141" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default CartItem;
