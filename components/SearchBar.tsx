import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDebouncedCallback } from "use-debounce";

const SearchBar = () => {
  const searhParams = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(searhParams.query);

  const debouncedSearch = useDebouncedCallback(
    (text: string) => router.push(`/search?query=${text}`),
    500
  );

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text) router.setParams({ query: undefined });
    //debouncedSearch(text);
  };

  const handleSubmit = () => {
    if (query?.trim()) router.setParams({ query });
  };
  return (
    <View
      className="searchbar"
      style={
        Platform.OS === "android"
          ? { elevation: 5, shadowColor: "#878787" }
          : {}
      }
    >
      <TextInput
        className="flex-1 p-5"
        placeholder="Search for pizza, burgers..."
        value={query}
        onChangeText={handleSearch}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        placeholderTextColor={"#A0A0A0"}
      />
      <TouchableOpacity
        className="pr-5"
        onPress={() => {
          router.setParams({ query });
        }}
      >
        <Image
          source={images.search}
          className="size-6"
          resizeMode="contain"
          tintColor={"#5D5F60"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
