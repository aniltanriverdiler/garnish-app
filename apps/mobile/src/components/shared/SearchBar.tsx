import { images } from '@/constants';
import React, { useCallback, useRef, useState } from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const DEBOUNCE_MS = 300;

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(text.trim());
      }, DEBOUNCE_MS);
    },
    [onSearch]
  );

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch(query.trim());
  }, [onSearch, query]);

  return (
    <View className="searchbar">
      <TextInput
        className="flex-1 p-5"
        placeholder="Search for any food"
        value={query}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        placeholderTextColor="#A0A0A0"
        returnKeyType="search"
      />
      <TouchableOpacity className="pr-5" onPress={handleSubmit}>
        <Image source={images.search} className="size-6" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
