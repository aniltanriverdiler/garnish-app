import { FlatList, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import CartButton from '@/components/shared/CartButton';
import cn from 'clsx';
import MenuCard from '@/components/shared/MenuCard';
import Filter from '@/components/shared/Filter';
import SearchBar from '@/components/shared/SearchBar';
import { images } from '@/constants';
import { getProducts, getCategories } from '@/services/product.service';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: () =>
      getProducts({
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
      }),
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  // ListHeaderComponent must be JSX element (not inline function component)
  // to prevent SearchBar from unmounting/remounting on every render
  const listHeader = (
    <View className="my-5 gap-5">
      <View className="flex-between w-full flex-row">
        <View className="flex-start">
          <Text className="small-bold uppercase text-primary">Search</Text>
          <View className="flex-start mt-0.5 flex-row gap-x-1">
            <Text className="paragraph-semibold text-dark-100">Find your Favorite Food</Text>
          </View>
        </View>

        <CartButton />
      </View>

      <SearchBar onSearch={handleSearch} />

      <Filter categories={categories} onCategoryChange={handleCategoryChange} />
    </View>
  );

  return (
    <SafeAreaView className="h-full bg-gray-50">
      <FlatList
        data={products}
        renderItem={({ item, index }) => {
          const isRightColumn = index % 2 !== 0;

          return (
            <View className={cn('max-w-[48%] flex-1', isRightColumn ? 'mt-10' : 'mt-0')}>
              <MenuCard item={item} />
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={() =>
          !isLoading ? (
            <View className="mt-10 items-center gap-4 px-10">
              <Image source={images.emptyState} className="size-40" resizeMode="contain" />
              <Text className="h3-bold text-center text-dark-100">Nothing matched your search</Text>
              <Text className="body-regular text-center text-gray-200">
                Try a different search term or check for typos.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
