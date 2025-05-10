import { getTodos, createTodo, completeTodo, uncompleteTodo, deleteTodo, updateTodo } from "./api/api.js";

// Initialize date picker
document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#due-date", {
        dateFormat: "Y-m-d",
        minDate: "today",
        allowInput: true,
        static: true
    });
});

// Helper functions
function getCategoryClass(category) {
    const classes = {
        work: 'bg-primary',
        personal: 'bg-success',
        shopping: 'bg-warning text-dark',
        other: 'bg-secondary'
    };
    return classes[category] || 'bg-secondary';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getPriorityClass(dueDate) {
    if (!dueDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'border-start border-danger';
    if (diffDays === 0) return 'border-start border-danger';
    if (diffDays <= 2) return 'border-start border-warning';
    return '';
}

function updateItemCount() {
    const todolist = document.getElementById("todo-list");
    const itemCount = todolist.childElementCount; 
    const itemCountSpan = document.getElementById("item-count");
    itemCountSpan.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`; 
}

// Todo management functions
function updateTodoVisualState(todoItem, isCompleted) {
    todoItem.classList.toggle('completed-task', isCompleted);
    todoItem.querySelector('.task-title').classList.toggle('text-decoration-line-through', isCompleted);
    todoItem.querySelector('.edit-btn').disabled = isCompleted;
}

async function toggleTodoCompletion(checkbox) {
    const todoItem = checkbox.closest('li');
    const isCompleted = checkbox.checked;
    
    updateTodoVisualState(todoItem, isCompleted);
    
    try {
        await (isCompleted ? completeTodo(todoItem.dataset.id) : uncompleteTodo(todoItem.dataset.id));
    } catch (error) {
        console.error('Error:', error);
        checkbox.checked = !isCompleted;
        updateTodoVisualState(todoItem, !isCompleted);
    }
}

// Display functions
function displayTodos(todos) {
    const todolist = document.getElementById("todo-list");
    todolist.innerHTML = "";
    
    todos.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
    
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todolist.appendChild(todoItem);
    });
    updateItemCount();
}

function createTodoElement(todo) {
    const todoItem = document.createElement("li");
    todoItem.dataset.id = todo.id;
    todoItem.className = `list-group-item d-flex align-items-center py-3 ${getPriorityClass(todo.dueDate)}`;
    
    todoItem.innerHTML = `
        <input type="checkbox" class="form-check-input me-3 complete-checkbox" ${todo.completed ? 'checked' : ''}>
        <div class="flex-grow-1">
            <div class="d-flex align-items-center">
                <span class="badge ${getCategoryClass(todo.category)} me-2">${todo.category}</span>
                <span class="task-title ${todo.completed ? 'text-decoration-line-through' : ''}">${todo.Title}</span>
            </div>
            <div class="d-flex mt-1">
                <small class="text-muted"><i class="bi bi-clock me-1"></i>${new Date(todo.createdAt).toLocaleString()}</small>
                ${todo.dueDate ? `<small class="text-muted ms-2"><i class="bi bi-calendar me-1"></i>${formatDate(todo.dueDate)}</small>` : ''}
            </div>
        </div>
        <div class="d-flex">
            <button class="edit-btn btn btn-sm btn-outline-secondary me-2" data-id="${todo.id}" ${todo.completed ? 'disabled' : ''}>
                <i class="bi bi-pencil"></i>
            </button>
            <button class="delete-btn btn btn-sm btn-outline-danger" data-id="${todo.id}">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    return todoItem;
}
// Add this right after the other event handlers in script.js

// Add new todo functionality
document.getElementById("add-btn").addEventListener("click", async () => {
    const inputField = document.getElementById("new-todo");
    const title = inputField.value.trim();
    const category = document.getElementById("todo-category").value;
    const dueDate = document.getElementById("due-date").value;

    if (!title) {
        alert("Please enter a task description");
        return;
    }

    const newTodo = {
        Title: title,
        category: category,
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString()
    };

    try {
        const createdTodo = await createTodo(newTodo);
        const todoItem = createTodoElement(createdTodo);
        document.getElementById("todo-list").prepend(todoItem);
        updateItemCount();
        
        // Clear inputs
        inputField.value = "";
        document.getElementById("due-date").value = "";
        inputField.focus();
    } catch (error) {
        console.error("Failed to create todo:", error);
        alert("Failed to add task. Please try again.");
    }
});

// Add Enter key support for the input field
document.getElementById("new-todo").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("add-btn").click();
    }
});

// Event handlers
function handleEdit(button) {
    const todoItem = button.closest('li');
    const titleSpan = todoItem.querySelector('.task-title');
    
    // Create editing input
    const input = document.createElement('input');
    input.value = titleSpan.textContent;
    input.className = 'edit-input';
    
    // Replace text with input
    titleSpan.replaceWith(input);
    input.focus();
    
    // Update button appearance
    button.innerHTML = '<i class="bi bi-check"></i>';
    button.classList.replace('btn-outline-secondary', 'btn-outline-success');
    
    const finishEdit = () => {
        const newTitle = input.value.trim();
        if (newTitle) {
            titleSpan.textContent = newTitle;
            updateTodo(todoItem.dataset.id, {
                Title: newTitle,
                completed: todoItem.querySelector('.complete-checkbox').checked
            }).catch(console.error);
        }
        input.replaceWith(titleSpan);
        button.innerHTML = '<i class="bi bi-pencil"></i>';
        button.classList.replace('btn-outline-success', 'btn-outline-secondary');
    };
    
    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => e.key === 'Enter' && finishEdit());
}

document.addEventListener('change', (event) => {
    if (event.target.classList.contains('complete-checkbox')) {
        toggleTodoCompletion(event.target);
    }
});

document.addEventListener('click', (event) => {
    if (event.target.closest('.delete-btn')) {
        const button = event.target.closest('.delete-btn');
        const todoItem = button.closest('li');
        if (confirm("Delete this task?")) {
            deleteTodo(todoItem.dataset.id)
                .then(() => {
                    todoItem.remove();
                    updateItemCount();
                })
                .catch(console.error);
        }
    }
    
    if (event.target.closest('.edit-btn')) {
        handleEdit(event.target.closest('.edit-btn'));
    }
});

// Initial load
getTodos()
    .then(displayTodos)
    .catch(console.error);