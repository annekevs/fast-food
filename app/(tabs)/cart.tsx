import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { useCartStore } from "@/store/cart.store";
import { PaymentInfoStripeProps } from "@/type";
import cn from "clsx";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const Cart = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <SafeAreaView className="bg-white h-full px-5 my-5 pb-32">
      <FlatList
        data={items}
        renderItem={({ item, index }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28 pt-5"
        ListHeaderComponentStyle={{ paddingBottom: 15 }}
        ListHeaderComponent={() => (
          <>
            <CustomHeader title="Your cart" />
            <View className="flex-row flex-between mb-5">
              <View className="flex-start">
                <Text className="small-bold text-primary">DELIVER TO</Text>
                <Text className="paragragh-bold">Home</Text>
              </View>
              <TouchableOpacity className="rounded-full bg-white border-primary flex-center px-6 py-3 border-2 drop-shadow-md ">
                <Text className="text-primary ">Change Location</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        ListEmptyComponent={() => <Text>Cart empty</Text>}
        ListFooterComponent={() =>
          totalItems > 0 && (
            <View className="gap-5">
              <View className="mt-6 border-gray-200 p-5 rounded-2xl">
                <Text className="h&-bold text-dark-100 mt-5">
                  Payment Summary
                </Text>
                <PaymentInfoStripe
                  label={`Total Items (${totalItems})`}
                  value={`${totalPrice.toFixed(2)} €`}
                />
                <PaymentInfoStripe label={`Delivery Fee`} value={`5.00€`} />
                <PaymentInfoStripe
                  label={`Discount`}
                  value={`-0.50€`}
                  valueStyle="text-success"
                />
                <View className="border-1 border-gray-300 my-2" />

                <PaymentInfoStripe
                  label={`Total`}
                  value={(totalPrice + 5 - 0.5).toFixed(2)}
                  labelStyle="base-bold text-dark-100"
                  valueStyle="base-bold text-dark-100 text-right"
                />

                <CustomButton title="Order Now" style="mt-10" />
              </View>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

export default Cart;
