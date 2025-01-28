import AsyncStorage from "@react-native-async-storage/async-storage";
import { Todo, BaseTodo, Priority, TodoInput } from "../types/types";
import { BASE_URL } from "@env";

const STORAGE_KEY = "@todos";

export const todoApi = {
  initializeTodos: async (): Promise<Todo[]> => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (!storedTodos) {
        const response = await fetch(`${BASE_URL}/todos`);
        const data: BaseTodo[] = await response.json();
        const initialTodos: Todo[] = data.slice(0, 10).map((todo) => ({
          ...todo,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          // id: Date.now().toString(), // Add ID since we're only getting base todos
          priority: Priority.MEDIUM,
          dueDate: null,
          createdAt: new Date().toISOString(),
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialTodos));
        return initialTodos;
      }
      return JSON.parse(storedTodos) as Todo[];
    } catch (error) {
      console.error("Error initializing todos:", error);
      return [];
    }
  },

  fetchTodos: async (): Promise<Todo[]> => {
    try {
      const todosString = await AsyncStorage.getItem(STORAGE_KEY);
      const todos: Todo[] = todosString ? JSON.parse(todosString) : [];
      return todos.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("Error fetching todos:", error);
      return [];
    }
  },

  fetchTodoById: async (id: string): Promise<Todo | null> => {
    try {
      const todos = await todoApi.fetchTodos();
      const localTodo = todos.find((todo) => todo.id === id);

      if (localTodo) {
        return localTodo;
      }

      const response = await fetch(`${BASE_URL}/todos/${id}`);
      const apiTodo: BaseTodo = await response.json();
      return {
        ...apiTodo,
        id,
        priority: Priority.MEDIUM,
        dueDate: null,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching todo:", error);
      return null;
    }
  },

  addTodo: async (todo: TodoInput): Promise<Todo> => {
    try {
      const response = await fetch(`${BASE_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: todo.title,
          completed: false,
        }),
      });
      const apiResponse: BaseTodo = await response.json();

      const todos = await todoApi.fetchTodos();
      const newTodo: Todo = {
        ...apiResponse,
        id: Date.now().toString(),
        priority: todo.priority || Priority.MEDIUM,
        dueDate: todo.dueDate || null,
        createdAt: new Date().toISOString(),
      };
      const updatedTodos = [...todos, newTodo];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      return newTodo;
    } catch (error) {
      console.error("Error adding todo:", error);
      throw error;
    }
  },

  updateTodo: async (todo: Partial<Todo> & { id: string }): Promise<Todo> => {
    try {
      await fetch(`${BASE_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      });

      const todos = await todoApi.fetchTodos();
      const existingTodo = todos.find((t) => t.id === todo.id);

      if (!existingTodo) {
        throw new Error(`Todo with id ${todo.id} not found`);
      }

      const updatedTodo: Todo = { ...existingTodo, ...todo };
      const updatedTodos = todos.map((t) =>
        t.id === todo.id ? updatedTodo : t
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      return updatedTodo;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  },

  toggleTodo: async (id: string): Promise<Todo> => {
    const todo = await todoApi.fetchTodoById(id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    return await todoApi.updateTodo({
      id,
      completed: !todo.completed,
    });
  },

  deleteTodo: async (id: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/todos/${id}`, {
        method: "DELETE",
      });

      const todos = await todoApi.fetchTodos();
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  },
};
