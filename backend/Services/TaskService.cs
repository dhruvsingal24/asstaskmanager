using WebApplication1.Models;

namespace WebApplication1.Services
{
    public class TaskService
    {
        private readonly List<TaskItem> _tasks = new();

        public List<TaskItem> GetAllTasks()
        {
            return _tasks;
        }

        public TaskItem? GetTaskById(Guid id)
        {
            return _tasks.FirstOrDefault(t => t.Id == id);
        }

        public TaskItem AddTask(string description)
        {
            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Description = description,
                IsCompleted = false
            };
            _tasks.Add(task);
            return task;
        }

        public TaskItem? UpdateTask(Guid id, string? description = null, bool? isCompleted = null)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null) return null;

            if (description != null)
                task.Description = description;
            
            if (isCompleted.HasValue)
                task.IsCompleted = isCompleted.Value;

            return task;
        }

        public bool DeleteTask(Guid id)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null) return false;

            _tasks.Remove(task);
            return true;
        }
    }
}