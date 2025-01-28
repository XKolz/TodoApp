// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TodoListScreen from "./screens/TodoListScreen";
import TodoDetailScreen from "./screens/TodoDetailScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="TodoList"
              component={TodoListScreen}
              options={{ title: "Todo List" }}
            />
            <Stack.Screen
              name="TodoDetail"
              component={TodoDetailScreen}
              options={{ title: "Todo Details" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
