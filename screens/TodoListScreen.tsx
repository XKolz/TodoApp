import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ListRenderItem,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { todoApi } from "../api/todoApi";
import { PriorityBadge, priorityColors } from "../components/PriorityBadge";
import { TodoListScreenProps, Todo, TodoInput, Priority } from "../types/types";
// For debugging, clear storage on every reload
// import { clearStorage } from "../utils/storage";

const { width } = Dimensions.get("window");

export default function TodoListScreen({ navigation }: TodoListScreenProps) {
  const [newTodo, setNewTodo] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    Priority.MEDIUM
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      await todoApi.initializeTodos();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    };
    init();
    // For debugging, clear storage on every reload
    // clearStorage();
  }, []);

  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: todoApi.fetchTodos,
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (todoId: string) => todoApi.deleteTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const addTodoMutation = useMutation({
    mutationFn: (todoInput: TodoInput) => todoApi.addTodo(todoInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
      setShowAddModal(false);
      setSelectedPriority(Priority.MEDIUM);
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: (todoId: string) => todoApi.toggleTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodoMutation.mutate({
        title: newTodo,
        completed: false,
        priority: selectedPriority,
      });
    }
  };

  const handleDelete = (todoId: string) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => deleteTodoMutation.mutate(todoId),
        style: "destructive",
      },
    ]);
  };

  const renderRightActions = (todoId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(todoId)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const renderItem: ListRenderItem<Todo> = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      rightThreshold={40}
    >
      <View
        style={[
          styles.todoItem,
          {
            borderLeftColor: priorityColors[item.priority],
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.todoInfo}>
          <Text
            style={[styles.todoTitle, item.completed && styles.completedTodo]}
          >
            {item.title}
          </Text>
          <View style={styles.todoMeta}>
            <PriorityBadge priority={item.priority} />
            <Text
              style={[
                styles.todoStatus,
                { color: item.completed ? "#4CAF50" : "#FF9800" },
              ]}
            >
              {item.completed ? "Completed" : "In Progress"}
            </Text>
          </View>
        </View>
        <View style={styles.todoActions}>
          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={() =>
              navigation.navigate("TodoDetail", { todoId: item.id })
            }
          >
            <Ionicons name="eye-outline" size={18} color="#007AFF" />
            <Text style={styles.viewDetailsBtn}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              item.completed ? styles.completedButton : styles.pendingButton,
            ]}
            onPress={() => toggleTodoMutation.mutate(item.id)}
          >
            <Ionicons
              name={
                item.completed
                  ? "close-circle-outline"
                  : "checkmark-circle-outline"
              }
              size={18}
              color="white"
            />
            <Text style={styles.buttonText}>
              {item.completed ? "Undo" : "Complete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {todos && todos.length > 0 ? (
        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Todos Yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button below to create your first todo
          </Text>
        </View>
      )}

      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Todo</Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                value={newTodo}
                onChangeText={setNewTodo}
                placeholder="What needs to be done?"
                placeholderTextColor="#999"
                autoFocus={true}
                multiline={true}
                numberOfLines={3}
              />

              <Text style={styles.label}>Priority Level</Text>
              <View style={styles.priorityButtons}>
                {Object.values(Priority).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      selectedPriority === priority && styles.selectedPriority,
                      { backgroundColor: priorityColors[priority] + "20" },
                    ]}
                    onPress={() => setSelectedPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        { color: priorityColors[priority] },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() +
                        priority.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewTodo("");
                    setSelectedPriority(Priority.MEDIUM);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.addButton,
                    !newTodo.trim() && styles.disabledButton,
                  ]}
                  onPress={handleAddTodo}
                  disabled={!newTodo.trim()}
                >
                  <Text style={styles.addButtonText}>Create Todo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  todoItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todoInfo: {
    marginBottom: 12,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
    lineHeight: 24,
  },
  todoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  todoStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  todoActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  viewButton: {
    backgroundColor: "#F0F8FF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  viewDetailsBtn: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
  completedTodo: {
    textDecorationLine: "line-through",
    color: "#B2B2B2",
  },
  pendingButton: {
    backgroundColor: "#007AFF",
  },
  completedButton: {
    backgroundColor: "#4CAF50",
  },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    // justifyContent: "center",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,

    // backgroundColor: "#fff",
    // borderRadius: 16,
    // padding: 24,
    maxHeight: "90%", // Limit the modal height
    marginHorizontal: 16,
    marginBottom: Platform.OS === "ios" ? 34 : 24, // Account for bottom safe area
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
  },
  closeButton: {
    padding: 4,
  },
  modalInput: {
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 20,
    color: "#2C3E50",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  priorityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: width * 0.25,
    alignItems: "center",
  },
  selectedPriority: {
    transform: [{ scale: 1.05 }],
  },
  priorityButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#007AFF",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  floatingAddButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
