import React, { useState, useEffect } from 'react';
import { Trash2, Check, X, Plus } from 'lucide-react';

// Types
interface TaskItem {
  id: string;
  description: string;
  isCompleted: boolean;
}

const API_BASE_URL = 'https://assgntaskmanagerbackend.onrender.com/api/tasks';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Fetch all tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks. Using local storage mode.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new task (in-memory mode)
  const addTaskLocal = () => {
    if (!newTaskDescription.trim()) return;

    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      description: newTaskDescription,
      isCompleted: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskDescription('');
  };

  // Add a new task (API mode)
  const addTaskAPI = async () => {
    if (!newTaskDescription.trim()) return;

    try {
      setError(null);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newTaskDescription }),
      });

      if (!response.ok) throw new Error('Failed to add task');
      
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setNewTaskDescription('');
    } catch (err) {
      setError('Failed to add task. Switching to local storage.');
      addTaskLocal();
    }
  };

  // Toggle task completion (in-memory mode)
  const toggleTaskLocal = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  // Toggle task completion (API mode)
  const toggleTaskAPI = async (task: TaskItem) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !task.isCompleted,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task. Using local storage.');
      toggleTaskLocal(task.id);
    }
  };

  // Delete a task (in-memory mode)
  const deleteTaskLocal = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Delete a task (API mode)
  const deleteTaskAPI = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task. Using local storage.');
      deleteTaskLocal(id);
    }
  };

  // Sort tasks: pending first, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return 0;
  });

  // Filter tasks based on selected filter
  const filteredTasks = sortedTasks.filter(task => {
    if (filter === 'pending') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true; // 'all'
  });

  // Choose which function to use based on mode
  const addTask = () => {
    if (useLocalStorage) {
      addTaskLocal();
    } else {
      addTaskAPI();
    }
  };

  const toggleTask = (task: TaskItem) => {
    if (useLocalStorage) {
      toggleTaskLocal(task.id);
    } else {
      toggleTaskAPI(task);
    }
  };

  const deleteTask = (id: string) => {
    if (useLocalStorage) {
      deleteTaskLocal(id);
    } else {
      deleteTaskAPI(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // Load tasks from API on mount if not using in-memory storage
  useEffect(() => {
    if (!useLocalStorage) {
      fetchTasks();
    }
  }, [useLocalStorage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Manager</h1>
              <p className="text-gray-600">Organize your tasks efficiently</p>
            </div>
            {/* Mode Toggle */}
            <div className="flex flex-col items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">
                  {useLocalStorage ? '💾 In-Memory' : '☁️ API Mode'}
                </span>
                <div 
                  onClick={() => setUseLocalStorage(!useLocalStorage)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    useLocalStorage ? 'bg-blue-500' : 'bg-gray-300'
                  } relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    useLocalStorage ? 'left-7' : 'left-1'
                  }`} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-yellow-700 hover:text-yellow-900">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Add Task Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a new task..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTask}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Tasks ({filteredTasks.length})
            </h2>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending ({tasks.filter(t => !t.isCompleted).length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Completed ({tasks.filter(t => t.isCompleted).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' 
                ? 'No tasks yet. Add one to get started!'
                : filter === 'pending'
                ? 'No pending tasks!'
                : 'No completed tasks!'}
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Completion Toggle */}
                  <button
                    onClick={() => toggleTask(task)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {task.isCompleted && <Check size={16} className="text-white" />}
                  </button>

                  {/* Task Description */}
                  <span
                    className={`flex-1 ${
                      task.isCompleted
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                    }`}
                  >
                    {task.description}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {task.isCompleted ? 'Completed' : 'Pending'}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => !t.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;