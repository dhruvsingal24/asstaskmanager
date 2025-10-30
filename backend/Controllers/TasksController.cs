using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        // GET: api/tasks
        [HttpGet]
        public ActionResult<List<TaskItem>> GetAllTasks()
        {
            var tasks = _taskService.GetAllTasks();
            return Ok(tasks);
        }

        // POST: api/tasks
        [HttpPost]
        public ActionResult<TaskItem> CreateTask([FromBody] CreateTaskDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Description))
            {
                return BadRequest(new { message = "Description is required" });
            }

            var task = _taskService.AddTask(dto.Description);
            return CreatedAtAction(nameof(GetAllTasks), new { id = task.Id }, task);
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public ActionResult<TaskItem> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
        {
            var task = _taskService.UpdateTask(id, dto.Description, dto.IsCompleted);
            
            if (task == null)
            {
                return NotFound(new { message = $"Task with id {id} not found" });
            }

            return Ok(task);
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteTask(Guid id)
        {
            var deleted = _taskService.DeleteTask(id);
            
            if (!deleted)
            {
                return NotFound(new { message = $"Task with id {id} not found" });
            }

            return NoContent();
        }
    }

    // DTOs (Data Transfer Objects)
    public class CreateTaskDto
    {
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateTaskDto
    {
        public string? Description { get; set; }
        public bool? IsCompleted { get; set; }
    }
}