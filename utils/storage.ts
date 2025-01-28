import AsyncStorage from "@react-native-async-storage/async-storage";

// Clear all data in AsyncStorage (for debugging)
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared!");
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
};
