import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useCartStore from '@/store/cart-store';
import CustomButton from '@/components/ui/CustomButton';
import CartItem from '@/components/shared/CartItem';
import { images } from '@/constants';
import cn from 'clsx';
import { PaymentInfoStripeProps } from '@/types';

const PaymentInfoStripe = ({ label, value, labelStyle, valueStyle }: PaymentInfoStripeProps) => (
  <View className="flex-between my-1.5 flex-row">
    <Text className={cn('paragraph-medium text-gray-200', labelStyle)}>{label}</Text>
    <Text className={cn('paragraph-bold text-dark-100', valueStyle)}>{value}</Text>
  </View>
);

export default function Cart() {
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = 0;
  const discount = totalItems > 0 ? +(totalPrice * 0.1).toFixed(2) : 0;
  const total = +(totalPrice + deliveryFee - discount).toFixed(2);

  const listHeader = (
    <View className="mb-4 gap-5">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={images.arrowBack} className="size-7" resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Image source={images.search} className="size-7" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Delivery Location */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-quicksand-bold text-xs uppercase text-primary">
            Delivery Location
          </Text>
          <Text className="paragraph-bold text-dark-100">Home</Text>
        </View>
        <TouchableOpacity className="rounded-full border border-primary px-4 py-2">
          <Text className="font-quicksand-medium text-sm text-primary">Change Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const listFooter =
    totalItems > 0 ? (
      <View className="mt-4 gap-4">
        {/* Payment Summary Card */}
        <View className="rounded-2xl bg-white p-5 shadow-xl shadow-black/60">
          <Text className="h3-bold mb-4 text-dark-100">Payment Summary</Text>

          <PaymentInfoStripe
            label={`Total Items (${totalItems})`}
            value={`$${totalPrice.toFixed(2)}`}
          />

          <PaymentInfoStripe label="Delivery Fee" value="Free" />

          <PaymentInfoStripe
            label="Discount"
            value={`-$${discount.toFixed(2)}`}
            valueStyle="!text-error"
          />

          <View className="my-3 border-t border-gray-200" />

          <PaymentInfoStripe
            label="Total"
            value={`$${total.toFixed(2)}`}
            labelStyle="paragraph-bold !text-dark-100"
            valueStyle="paragraph-bold !text-dark-100"
          />
        </View>

        <CustomButton title="Order Now" />
      </View>
    ) : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pt-5 pb-32"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={() => (
          <View className="mt-10 items-center gap-3 px-5">
            <Image source={images.emptyState} className="size-40" resizeMode="contain" />
            <Text className="h3-bold text-center text-dark-100">Your cart is empty</Text>
            <Text className="body-regular text-center text-gray-200">
              Add items to start your order
            </Text>
          </View>
        )}
        ListFooterComponent={listFooter}
      />
    </SafeAreaView>
  );
}
