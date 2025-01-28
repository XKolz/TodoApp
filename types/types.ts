import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  TodoList: undefined;
  TodoDetail: { todoId: string };
};

export type NavigationProps = NativeStackScreenProps<RootStackParamList>;
export type TodoListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "TodoList"
>;
export type TodoDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "TodoDetail"
>;

// Domain Types
export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Base Todo type for consistent properties
export interface BaseTodo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
}

// API Todo type
export interface ApiTodo extends BaseTodo {
  createdAt: string;
  dueDate: string;
}

// Domain Todo type
export interface Todo extends BaseTodo {
  createdAt: string;
  dueDate: string | null;
}

// Input types
export interface TodoInput {
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string | null;
}

// API types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Update payload type that works with both API and domain models
export type UpdateTodoPayload = {
  id: string;
  title?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: string;
};

// Component Props Types
export interface PriorityBadgeProps {
  priority: Priority;
}

// Constants
export const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: "#4CAF50", // Green
  [Priority.MEDIUM]: "#FFC107", // Yellow
  [Priority.HIGH]: "#F44336", // Red
};
