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
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { todoApi } from "../api/todoApi";
import { PriorityBadge, priorityColors } from "../components/PriorityBadge";
import { TodoListScreenProps, Todo, TodoInput, Priority } from "../types/types";
// For debugging, clear storage on each load
import { clearStorage } from "../utils/storage";

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
    // For debugging, clear storage on each load
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
      <View style={styles.todoItem}>
        <View style={styles.todoInfo}>
          <Text
            style={[styles.todoTitle, item.completed && styles.completedTodo]}
          >
            {item.title}
          </Text>
          <View style={styles.todoMeta}>
            <PriorityBadge priority={item.priority} />
            <Text style={styles.todoStatus}>
              {item.completed ? "Completed" : "In Progress"}
            </Text>
          </View>
        </View>
        <View style={styles.todoActions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("TodoDetail", { todoId: item.id })
            }
          >
            <Text style={styles.viewDetailsBtn}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              item.completed ? styles.completedButton : styles.pendingButton,
            ]}
            onPress={() => toggleTodoMutation.mutate(item.id)}
          >
            <Text style={styles.buttonText}>
              {item.completed ? "Mark Incomplete" : "Mark Complete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
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
          keyExtractor={(item, index) => `todo-${item.id}-${index}`}
          style={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>No Todos Yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button below to create your first todo
          </Text>
        </View>
      )}

      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Todo</Text>

            <TextInput
              style={styles.modalInput}
              value={newTodo}
              onChangeText={setNewTodo}
              placeholder="Enter todo title"
              autoFocus={true}
              multiline={true}
              numberOfLines={3}
            />

            <Text style={styles.label}>Priority:</Text>
            <View style={styles.priorityButtons}>
              {Object.values(Priority).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    selectedPriority === priority && styles.selectedPriority,
                    { backgroundColor: priorityColors[priority] },
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <Text style={styles.priorityButtonText}>
                    {priority.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewTodo("");
                  setSelectedPriority(Priority.MEDIUM);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddTodo}
                disabled={!newTodo.trim()}
              >
                <Text style={styles.buttonText}>Add Todo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  list: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todoInfo: {
    marginBottom: 8,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  todoStatus: {
    fontSize: 14,
    color: "#666",
  },
  todoActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 8,
    borderRadius: 4,
    minWidth: 100,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  viewDetailsBtn: {
    color: "black",
    fontWeight: "500",
  },
  completedTodo: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  pendingButton: {
    backgroundColor: "#007AFF",
  },
  completedButton: {
    backgroundColor: "#32CD32",
  },
  deleteAction: {
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalInput: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    minHeight: 80,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  priorityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  selectedPriority: {
    transform: [{ scale: 1.1 }],
  },
  priorityButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  todoMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
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
