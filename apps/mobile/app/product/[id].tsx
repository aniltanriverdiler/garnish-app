import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/product.service';
import useCartStore from '@/store/cart-store';
import { images, OPTION_IMAGE_MAP } from '@/constants';
import { OptionType } from '@garnish/shared';
import type { ProductOption } from '@garnish/shared';
import cn from 'clsx';

interface OptionCardProps {
  option: ProductOption;
  selected: boolean;
  onToggle: (option: ProductOption) => void;
}

const OptionCard = ({ option, selected, onToggle }: OptionCardProps) => {
  const localImage = OPTION_IMAGE_MAP[option.name];

  return (
    <TouchableOpacity
      onPress={() => onToggle(option)}
      className="mr-3 w-20 overflow-hidden rounded-2xl"
      style={Platform.OS === 'android' ? { elevation: 4, shadowColor: '#000' } : {}}>
      <View className={cn('h-16 items-center justify-center', selected ? 'bg-primary/10' : 'bg-white')}>
        {localImage && <Image source={localImage} className="h-12 w-12" resizeMode="contain" />}
      </View>
      <View className={cn('flex-row items-center justify-between px-2 py-1.5', selected ? 'bg-primary' : 'bg-dark-100')}>
        <Text className="flex-1 font-quicksand-medium text-xs text-white" numberOfLines={1}>
          {option.name}
        </Text>
        <View className={cn('ml-1 size-5 items-center justify-center rounded-full', selected ? 'bg-white' : 'bg-red-500')}>
          <Image
            source={selected ? images.check : images.plus}
            className="size-2.5"
            tintColor={selected ? '#FE8C00' : 'white'}
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(new Set());
  const { addItem } = useCartStore();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  const toppings = useMemo(
    () => product?.options?.filter((o) => o.type === OptionType.TOPPING) ?? [],
    [product]
  );
  const sides = useMemo(
    () => product?.options?.filter((o) => o.type === OptionType.SIDE) ?? [],
    [product]
  );

  const selectedOptions = useMemo(
    () => [...toppings, ...sides].filter((o) => selectedOptionIds.has(o.id)),
    [toppings, sides, selectedOptionIds]
  );

  const optionsPrice = useMemo(
    () => selectedOptions.reduce((sum, o) => sum + o.price, 0),
    [selectedOptions]
  );

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return (product.price + optionsPrice) * quantity;
  }, [product, quantity, optionsPrice]);

  const handleToggleOption = useCallback((option: ProductOption) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(option.id)) next.delete(option.id);
      else next.add(option.id);
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-center flex-1">
          <ActivityIndicator size="large" color="#FE8C00" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-center flex-1 px-6">
          <Text className="base-bold text-dark-100">Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = async () => {
    const cartOptions = selectedOptions.map((o) => ({
      optionId: o.id,
      name: o.name,
      price: o.price,
      type: o.type,
    }));

    for (let i = 0; i < quantity; i++) {
      await addItem({
        id: product.id,
        productId: product.id,
        restaurantId: product.restaurantId,
        name: product.name,
        price: product.price,
        image: product.image,
        options: cartOptions,
      });
    }
    Alert.alert('Added to cart', `${quantity}x ${product.name}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-12">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={images.arrowBack} className="size-7" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Image source={images.search} className="size-7" />
          </TouchableOpacity>
        </View>

        {/* Product Name */}
        <Text className="mb-5 mt-8 font-quicksand-bold text-2xl text-dark-100">
          {product.name}
        </Text>

        {/* Product Details */}
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-col items-start justify-start">
            <Text className="font-quicksand-regular mb-5 mt-4 text-base text-gray-500">
              {product.category?.name}
            </Text>

            {/* Rating */}
            <View className="mb-5 flex-row items-center justify-start">
              {[...Array(5)].map((_, i) => (
                <Image
                  key={i}
                  source={images.star}
                  className="mr-1 h-5 w-5"
                  style={{ tintColor: '#FE8C00' }}
                  resizeMode="contain"
                />
              ))}
              <Text className="ml-2 font-quicksand-semibold text-base text-gray-500">
                {product.rating ?? '5.0'}/5
              </Text>
            </View>

            {/* Price */}
            <Text className="font-quicksand-bold text-2xl text-dark-100">${product.price}</Text>

            {/* Calories and Protein */}
            <View className="mb-10 mt-10 flex-row items-center justify-start gap-8">
              <View className="flex-col items-start justify-start gap-2">
                <Text className="font-quicksand-bold text-gray-500">Calories</Text>
                <Text className="font-quicksand-bold text-black">
                  {product.calories ?? '0'} kcal
                </Text>
              </View>
              <View className="flex-col items-start justify-start gap-2">
                <Text className="font-quicksand-bold text-gray-500">Protein</Text>
                <Text className="font-quicksand-bold text-black">{product.protein ?? '0'} g</Text>
              </View>
            </View>

            <Text className="font-quicksand-bold text-lg text-gray-500">Bun Type</Text>
            <Text className="font-quicksand-bold text-lg text-black">Whole Wheat</Text>
          </View>

          {/* Product Image */}
          <Image
            source={{ uri: product.image }}
            className="h-[300px] w-[300px] rounded-lg"
            resizeMode="contain"
          />
        </View>

        {/* Delivery Info Bar */}
        <View className="mx-1 my-5 flex-row items-center justify-between rounded-full bg-white px-5 py-4 shadow-sm shadow-black/10">
          <View className="flex-row items-center justify-center gap-2">
            <Image source={images.dollar} className="size-4" resizeMode="contain" tintColor="#FE8C00" />
            <Text className="font-quicksand-bold text-base text-dark-100">Free Delivery</Text>
          </View>
          <View className="flex-row items-center justify-center gap-2">
            <Image source={images.clock} className="size-4" resizeMode="contain" tintColor="#FE8C00" />
            <Text className="font-quicksand-bold text-base text-dark-100">20 - 30 mins</Text>
          </View>
          <View className="flex-row items-center justify-center gap-2">
            <Image source={images.star} className="size-4" resizeMode="contain" tintColor="#FE8C00" />
            <Text className="font-quicksand-bold text-base text-dark-100">
              {product.rating ?? '5.0'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text className="font-quicksand-semibold text-base leading-6 text-gray-500">
          {product.description}
        </Text>

        {/* Toppings */}
        {toppings.length > 0 && (
          <View className="mt-6">
            <Text className="mb-3 font-quicksand-bold text-lg text-dark-100">Toppings</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {toppings.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selectedOptionIds.has(option.id)}
                  onToggle={handleToggleOption}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Side Options */}
        {sides.length > 0 && (
          <View className="mt-6">
            <Text className="mb-3 font-quicksand-bold text-lg text-dark-100">Side options</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sides.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selectedOptionIds.has(option.id)}
                  onToggle={handleToggleOption}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View
        className="mx-7 mb-3 rounded-2xl bg-white px-5 py-4 shadow-md shadow-black/55"
        style={Platform.OS === 'android' ? { elevation: 10 } : {}}>
        <View className="flex-row items-center justify-between">
          {/* Quantity Selector */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="size-9 items-center justify-center rounded-xl border border-gray-50 bg-[#FE8C00]/15"
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Image source={images.minus} className="size-4" resizeMode="contain" />
            </TouchableOpacity>
            <Text className="w-6 text-center font-quicksand-bold text-xl text-dark-100">
              {quantity}
            </Text>
            <TouchableOpacity
              className="size-9 items-center justify-center rounded-xl border border-gray-50 bg-[#FE8C00]/15"
              onPress={() => setQuantity((q) => q + 1)}>
              <Image source={images.plus} className="size-4" resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            className="flex-row items-center gap-3 rounded-full bg-primary px-6 py-3"
            onPress={handleAddToCart}>
            <Image source={images.bag} className="size-5" tintColor="white" resizeMode="contain" />
            <Text className="font-quicksand-bold text-base text-white">
              Add to cart (${totalPrice.toFixed(2)})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;
