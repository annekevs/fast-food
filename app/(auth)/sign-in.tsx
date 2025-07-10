import { router } from "expo-router";
import { Button, View } from "react-native";

const SignIn = () => {
  return (
    <View className="flex flex-center h-full">
      <Button title="Signin" onPress={() => router.push("/sign-up")} />
    </View>
  );
};

export default SignIn;
