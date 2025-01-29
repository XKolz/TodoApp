import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { todoApi } from "../api/todoApi";
import {
  TodoDetailScreenProps,
  UpdateTodoPayload,
  Priority,
} from "../types/types";
import { priorityColors } from "../components/PriorityBadge";

const { width } = Dimensions.get("window");

export default function TodoDetailScreen({
  route,
  navigation,
}: TodoDetailScreenProps) {
  const { todoId } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    Priority.MEDIUM
  );
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
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setIsEditing(false);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!todo) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Todo Not Found</Text>
        <Text style={styles.errorText}>
          This todo might have been deleted or doesn't exist.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEditPress = () => {
    setEditedTitle(todo.title);
    setSelectedPriority(todo.priority);
    setIsEditing(true);
  };

  const handleSavePress = () => {
    if (editedTitle.trim()) {
      updateTodoMutation.mutate({
        id: todo.id,
        title: editedTitle,
        priority: selectedPriority,
      });
    }
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
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonLabel}>Back</Text>
      </TouchableOpacity>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={[
            styles.card,
            !isEditing && {
              borderLeftColor: priorityColors[todo.priority],
              borderLeftWidth: 4,
            },
          ]}
        >
          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Edit Todo</Text>
                <TouchableOpacity onPress={handleCancelPress}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.editInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                multiline
                placeholder="Enter todo title"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Priority Level</Text>
              <View style={styles.priorityButtons}>
                {Object.values(Priority).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      {
                        backgroundColor:
                          selectedPriority === priority
                            ? priorityColors[priority]
                            : priorityColors[priority] + "20",
                        borderColor:
                          selectedPriority === priority
                            ? priorityColors[priority]
                            : "transparent",
                        borderWidth: selectedPriority === priority ? 2 : 0,
                      },
                    ]}
                    onPress={() => setSelectedPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        {
                          color:
                            selectedPriority === priority
                              ? "#fff"
                              : priorityColors[priority],
                        },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() +
                        priority.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancelPress}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    !editedTitle.trim() && styles.disabledButton,
                  ]}
                  onPress={handleSavePress}
                  disabled={!editedTitle.trim()}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={3}>
                  {todo.title}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditPress}
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      todo.completed
                        ? styles.completedBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    <Ionicons
                      name={todo.completed ? "checkmark-circle" : "time"}
                      size={16}
                      color="#FFF"
                    />
                    <Text style={styles.statusText}>
                      {todo.completed ? "Completed" : "In Progress"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: priorityColors[todo.priority] + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priorityColors[todo.priority] },
                      ]}
                    >
                      {todo.priority
                        ? todo.priority.charAt(0).toUpperCase() +
                          todo.priority.slice(1).toLowerCase()
                        : "Not set"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailValue}>
                      {formatDate(todo.dueDate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created</Text>
                  <View style={styles.dateContainer}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailValue}>
                      {formatDate(todo.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID</Text>
                  <Text style={styles.idValue}>{todo.id}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  backButtonLabel: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#F5F7FA",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
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
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    flex: 1,
    marginRight: 16,
    lineHeight: 28,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
    gap: 4,
  },
  editButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  detailValue: {
    fontSize: 15,
    color: "#2C3E50",
    marginLeft: 8,
  },
  idValue: {
    fontSize: 14,
    color: "#94A3B8",
    fontFamily: "monospace",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
  },
  pendingBadge: {
    backgroundColor: "#FF9800",
  },
  statusText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    fontWeight: "600",
    fontSize: 14,
  },
  editContainer: {
    padding: 4,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#2C3E50",
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
    opacity: 0.5,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
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
  priorityButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
});
