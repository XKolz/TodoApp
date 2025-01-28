import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "../api/todoApi";
import { TodoDetailScreenProps, Todo, UpdateTodoPayload } from "../types/types";

export default function TodoDetailScreen({ route }: TodoDetailScreenProps) {
  const { todoId } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: todo, isLoading } = useQuery({
    queryKey: ["todo", todoId],
    queryFn: () => todoApi.fetchTodoById(todoId),
  });

  const updateTodoMutation = useMutation({
    mutationFn: (updatedTodo: UpdateTodoPayload) =>
      todoApi.updateTodo(updatedTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
      setIsEditing(false);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!todo) {
    return (
      <View style={styles.container}>
        <Text>Todo not found</Text>
      </View>
    );
  }

  const handleEditPress = () => {
    setEditedTitle(todo.title);
    setIsEditing(true);
  };

  const handleSavePress = () => {
    updateTodoMutation.mutate({
      id: todo.id,
      title: editedTitle,
    });
  };

  const handleCancelPress = () => {
    setIsEditing(false);
    setEditedTitle("");
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <Text style={styles.label}>Edit Todo</Text>
            <TextInput
              style={styles.editInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              multiline
              placeholder="Enter todo title"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelPress}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSavePress}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>{todo.title}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditPress}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    todo.completed
                      ? styles.completedBadge
                      : styles.pendingBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {todo.completed ? "Completed" : "In Progress"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Priority:</Text>
                <Text style={styles.detailValue}>
                  {todo.priority ? todo.priority.toUpperCase() : "Not set"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(todo.dueDate)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(todo.createdAt)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID:</Text>
                <Text style={styles.detailValue}>{todo.id}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
//   // ... styles remain unchanged
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
  },
  pendingBadge: {
    backgroundColor: "#FFC107",
  },
  statusText: {
    color: "#fff",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  editContainer: {
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
});
