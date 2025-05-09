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

// Load todos on page load
getTodos()
    .then(displayTodos)
    .catch((error) => {
        console.error("Error fetching todos:", error);
    });

function displayTodos(todos) {
    const todolist = document.getElementById("todo-list");
    todolist.innerHTML = "";
    
    // Sort todos by due date (soonest first)
    todos.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
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
    
    const categoryBadge = todo.category ? `<span class="badge ${getCategoryClass(todo.category)} me-2">${todo.category}</span>` : '';
    const dueDateText = todo.dueDate ? `<small class="text-muted ms-2"><i class="bi bi-calendar me-1"></i>${formatDate(todo.dueDate)}</small>` : '';
    
    todoItem.innerHTML = `
        <input type="checkbox" class="form-check-input flex-shrink-0 me-3 complete-checkbox" ${todo.completed ? 'checked' : ''}>
        <div class="flex-grow-1 d-flex flex-column">
            <div class="d-flex align-items-center">
                ${categoryBadge}
                <span class="${todo.completed ? 'text-decoration-line-through text-muted' : ''}">${todo.Title}</span>
            </div>
            <div class="d-flex mt-1">
                <small class="text-muted"><i class="bi bi-clock me-1"></i>${new Date(todo.createdAt).toLocaleString()}</small>
                ${dueDateText}
            </div>
        </div>
        <div class="d-flex">
            <button class="edit-btn btn btn-sm btn-outline-secondary me-2" data-id="${todo.id}">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="delete-btn btn btn-sm btn-outline-danger" data-id="${todo.id}">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    return todoItem;
}

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
    
    if (diffDays < 0) return 'border-start border-danger border-4'; // Overdue
    if (diffDays === 0) return 'border-start border-danger border-4'; // Due today
    if (diffDays <= 2) return 'border-start border-warning border-4'; // Due soon (1-2 days)
    return '';
}

function addTodoToList(todo) {
    const todoItem = createTodoElement(todo);
    const todolist = document.getElementById("todo-list");
    todolist.appendChild(todoItem);
    updateItemCount();
}

function updateItemCount() {
    const todolist = document.getElementById("todo-list");
    const itemCount = todolist.childElementCount; 
    const itemCountSpan = document.getElementById("item-count");
    itemCountSpan.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`; 
}

// Add new todo
document.getElementById("add-btn").addEventListener("click", () => {
    const inputField = document.getElementById("new-todo");
    const title = inputField.value.trim();
    const category = document.getElementById("todo-category").value;
    const dueDate = document.getElementById("due-date").value;

    if (!title) {
        alert("Please enter a todo title.");
        return;
    }

    const todo = {
        Title: title,
        createdAt: new Date().toISOString(),
        completed: false,
        category: category,
        dueDate: dueDate || null
    };

    createTodo(todo)
        .then((newTodo) => {
            addTodoToList(newTodo);
            inputField.value = "";
            document.getElementById("due-date").value = "";
            inputField.focus();
        })
        .catch((error) => {
            console.error("Error creating todo:", error);
            alert("Failed to create the todo. Please try again.");
        });
});

// Handle Enter key in input field
document.getElementById("new-todo").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("add-btn").click();
    }
});

// Event delegation for delete and edit buttons
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn') || event.target.closest('.delete-btn')) {
        const btn = event.target.classList.contains('delete-btn') ? event.target : event.target.closest('.delete-btn');
        const todoItem = btn.closest('li');
        const todoId = todoItem.dataset.id;

        if (confirm("Are you sure you want to delete this task?")) {
            deleteTodo(todoId)
                .then(() => {
                    todoItem.remove();
                    updateItemCount();
                })
                .catch((error) => {
                    console.error('Error deleting todo:', error);
                });
        }
    }
    
    if (event.target.classList.contains("edit-btn") || event.target.closest('.edit-btn')) {
        const btn = event.target.classList.contains('edit-btn') ? event.target : event.target.closest('.edit-btn');
        const todoItem = btn.closest('li');
        const todoId = todoItem.dataset.id;
        const titleSpan = todoItem.querySelector("span");
        const currentTitle = titleSpan.textContent;

        // Create input field for editing
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = currentTitle;
        inputField.className = "form-control form-control-sm";
        titleSpan.replaceWith(inputField);
        inputField.focus();

        // Change button to Save
        btn.innerHTML = '<i class="bi bi-check"></i>';
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-outline-success");

        // Save handler (only once)
        const saveHandler = () => {
            const newTitle = inputField.value.trim();

            if (newTitle === "") {
                alert("The title cannot be empty.");
                return;
            }

            // Get current todo data
            const isCompleted = todoItem.querySelector('.complete-checkbox').checked;
            const category = todoItem.querySelector('.badge')?.textContent || 'other';
            const dueDateMatch = todoItem.textContent.match(/\d{4}-\d{2}-\d{2}/);
            const dueDate = dueDateMatch ? dueDateMatch[0] : null;

            const updatedTodo = {
                Title: newTitle,
                createdAt: new Date().toISOString(),
                completed: isCompleted,
                category: category,
                dueDate: dueDate
            };

            updateTodo(todoId, updatedTodo)
                .then(() => {
                    // Replace input with new title
                    const newTitleSpan = document.createElement("span");
                    newTitleSpan.textContent = newTitle;
                    if (isCompleted) {
                        newTitleSpan.classList.add('text-decoration-line-through', 'text-muted');
                    }
                    inputField.replaceWith(newTitleSpan);

                    // Change button back to Edit
                    btn.innerHTML = '<i class="bi bi-pencil"></i>';
                    btn.classList.remove("btn-outline-success");
                    btn.classList.add("btn-outline-secondary");
                })
                .catch((error) => {
                    console.error("Error updating todo:", error);
                });
        };

        // Add event listeners
        btn.removeEventListener('click', saveHandler);
        btn.addEventListener('click', saveHandler, { once: true });
        
        // Also save on Enter key
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveHandler();
            }
        });
    }
});

// Handle checkbox changes
document.addEventListener('change', (event) => {
    if (event.target.classList.contains('complete-checkbox')) {
        const checkbox = event.target;
        const todoItem = checkbox.closest('li');
        const todoId = todoItem.dataset.id;
        const isCompleted = checkbox.checked;
        const updateTodoStatus = isCompleted ? completeTodo : uncompleteTodo;

        updateTodoStatus(todoId)
            .then(() => {
                const titleElement = todoItem.querySelector('span');
                if (isCompleted) {
                    titleElement.classList.add('text-decoration-line-through', 'text-muted');
                } else {
                    titleElement.classList.remove('text-decoration-line-through', 'text-muted');
                }
            })
            .catch((error) => {
                console.error('Error updating todo:', error);
                alert('Failed to update the todo status. Please try again.');
                checkbox.checked = !isCompleted;
            });
    }
});

// Filter functionality
document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.dataset.filter;
        const todoItems = document.querySelectorAll('#todo-list li');
        
        todoItems.forEach(item => {
            const isCompleted = item.querySelector('.complete-checkbox').checked;
            
            switch(filter) {
                case 'active':
                    item.style.display = isCompleted ? 'none' : '';
                    break;
                case 'completed':
                    item.style.display = isCompleted ? '' : 'none';
                    break;
                default:
                    item.style.display = '';
            }
        });
    });
});

// Clear completed
document.getElementById('clear-completed').addEventListener('click', () => {
    const completedItems = document.querySelectorAll('#todo-list li');
    const completedIds = [];
    
    completedItems.forEach(item => {
        if (item.querySelector('.complete-checkbox').checked) {
            completedIds.push(item.dataset.id);
        }
    });

    if (completedIds.length === 0) {
        alert("No completed tasks to clear!");
        return;
    }

    if (confirm(`Are you sure you want to delete ${completedIds.length} completed tasks?`)) {
        const deletePromises = completedIds.map(id => deleteTodo(id));
        
        Promise.all(deletePromises)
            .then(() => {
                completedItems.forEach(item => {
                    if (item.querySelector('.complete-checkbox').checked) {
                        item.remove();
                    }
                });
                updateItemCount();
            })
            .catch(error => console.error('Error deleting todos:', error));
    }
});