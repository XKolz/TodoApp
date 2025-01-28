# React Native Todo Application

A feature-rich todo list application built with React Native and Expo, implementing both local storage and API integration.

## Features

- ✨ Create, read, update, and delete todos
- 🎯 Priority levels (Low, Medium, High) with color coding
- 💾 Local storage persistence using AsyncStorage
- 🌐 API integration with JSONPlaceholder
- 🎨 Clean and intuitive UI
- ⚡ Swipe-to-delete functionality
- 📱 Responsive design
- 🔄 Real-time updates

## Tech Stack

- React Native
- Expo
- React Query (TanStack Query)
- React Navigation
- AsyncStorage
- React Native Gesture Handler
- Expo Vector Icons

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js >= 14.0.0
- Expo CLI
- npm
- iOS Simulator/Android Emulator (optional)

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd react-native-todo-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npx expo start
```

## Project Structure

```
src/
├── api/
│   └── todoApi.ts         # API and local storage integration
├── components/
│   └── PriorityBadge.tsx   # Priority indicator component
├── screens/
│   ├── TodoListScreen.tsx  # Main todo list screen
│   └── TodoDetailScreen.tsx # Todo detail view
└── App.tsx                 # Root component
```

## Features in Detail

### Todo Management

- Create new todos with title and priority
- View list of all todos
- Mark todos as complete/incomplete
- Delete todos with swipe gesture
- View detailed todo information
- Edit existing todos

### Priority Levels

- Three priority levels: Low, Medium, High
- Color-coded visual indicators
- Priority selection during creation
- Priority editing in detail view

### Data Persistence

- Local storage using AsyncStorage
- API integration with JSONPlaceholder
- Offline capability
- Data synchronization

### User Interface

- Swipeable todo items
- Modal for creating todos
- Priority badges
- Loading indicators
- Confirmation dialogs
- Responsive design

## API Integration

The application integrates with JSONPlaceholder for mock API calls:

- GET /todos - Fetch todos
- POST /todos - Create todo
- PUT /todos/:id - Update todo
- DELETE /todos/:id - Delete todo

## Local Storage

Uses AsyncStorage for persistent local data storage:

- Stores todos locally
- Maintains priority and completion status
- Handles offline capability
- Syncs with API when available

## Main Components

### TodoListScreen

- Displays list of todos
- Handles todo creation
- Implements swipe-to-delete
- Shows priority badges
- Manages todo status

### TodoDetailScreen

- Shows detailed todo information
- Enables todo editing
- Displays creation date
- Shows priority and status

### PriorityBadge

- Visual indicator for todo priority
- Color-coded based on priority level
- Reusable component

## Dependencies

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.x.x",
    "@react-navigation/native": "^6.x.x",
    "@react-navigation/native-stack": "^6.x.x",
    "@tanstack/react-query": "^5.x.x",
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.2",
    "react-native-gesture-handler": "^2.x.x",
    "@expo/vector-icons": "^13.0.0"
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com)
