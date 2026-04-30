import { Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Category } from '@garnish/shared';
import { useState } from 'react';
import cn from 'clsx';

interface FilterProps {
  categories: Category[];
  onCategoryChange: (categoryId: string) => void;
}

const Filter = ({ categories, onCategoryChange }: FilterProps) => {
  const [active, setActive] = useState('all');

  const handlePress = (id: string) => {
    setActive(id);
    onCategoryChange(id === 'all' ? '' : id);
  };

  const filterData: { id: string; name: string }[] = [
    { id: 'all', name: 'All' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <FlatList
      data={filterData}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-x-2 pb-3"
      renderItem={({ item }) => (
        <TouchableOpacity
          key={item.id}
          className={cn('filter', active === item.id ? 'bg-primary' : 'bg-white')}
          style={Platform.OS === 'android' ? { elevation: 5, shadowColor: '#878787' } : {}}
          onPress={() => handlePress(item.id)}>
          <Text className={cn('body-medium', active === item.id ? 'text-white' : 'text-gray-200')}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default Filter;
