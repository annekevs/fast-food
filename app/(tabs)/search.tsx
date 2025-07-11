import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import { getCategories, getMenus } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppWrite";
import { Category, MenuItem } from "@/type";
import cn from "clsx";
import { isLoading } from "expo-font";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { query, category } = useLocalSearchParams<{
    query: string;
    category: string;
  }>();
  const {
    data: menus,
    refetch,
    loading,
  } = useAppwrite({
    fn: getMenus,
    params: {
      category,
      query,
      limit: 8,
    },
  });

  const { data: categories } = useAppwrite({
    fn: getCategories,
  });

  useEffect(() => {
    refetch({
      category,
      query,
      limit: 6,
    });
  }, [category, query]);

  return (
    <SafeAreaView className="bg-white h-full ">
      <FlatList
        data={menus}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;

          return (
            <View
              className={cn(
                "flex-1 max-w-48",
                isFirstRightColItem ? "mt-10" : "mt-0"
              )}
            >
              <MenuCard item={item as MenuItem} />
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">
                  Search
                </Text>
                <View className="flex-start flex-row gap-x-1 mt-0.5">
                  <Text className="paragraph-semibold text-dark-100">
                    Find your favorite food
                  </Text>
                </View>
              </View>
              <CartButton />
            </View>
            <SearchBar />
            <Filter categories={categories as Category[]} />
          </View>
        )}
        ListEmptyComponent={() => !isLoading && <Text>No result</Text>}
      />
    </SafeAreaView>
  );
};

export default Search;
