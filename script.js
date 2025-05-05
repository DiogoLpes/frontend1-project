import { getTodos, completeTodo, uncompleteTodo} from "./api/api.js";

function displayTodos(todos) {
    const todolist = document.getElementById("todo-list");
    todolist.innerHTML = "";

    if (!Array.isArray(todos)) {
        console.error("Invalid todos data:", todos);
        todolist.innerHTML = "<li>Error loading todos</li>";
        return;
    }

    todos.forEach(todo => {
        const todoItem = document.createElement("li");
        todoItem.dataset.id = todo.id; // Add data-id attribute to the <li> element
        todoItem.innerHTML = `
        <input type="checkbox" class="form-check-input me-3 complete-checkbox" ${todo.completed ? 'checked' : ''}>
        <div class="flex-grow-1 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}">
            <strong>${todo.Title}</strong><br>
            <small class="text-muted">Created At: ${new Date(todo.createdAt).toLocaleString()}</small>
        </div>
        <button class="edit-btn btn btn-sm btn-warning me-2" data-id="${todo.id}">Edit</button>
        <button class="delete-btn btn btn-sm btn-danger" data-id="${todo.id}">Delete</button>
    `;
        todolist.appendChild(todoItem);
    });
}

function createTodo(todo) {
    const todoItem = document.createElement("li");
    todoItem.dataset.id = todo.id; // Add data-id attribute to the <li> element
    todoItem.innerHTML = `
    <input type="checkbox" class="form-check-input me-3 complete-checkbox" ${todo.completed ? 'checked' : ''}>
    <div class="flex-grow-1 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}">
        <strong>${todo.Title}</strong><br>
        <small class="text-muted">Created At: ${new Date(todo.createdAt).toLocaleString()}</small>
    </div>
    <button class="edit-btn btn btn-sm btn-warning me-2" data-id="${todo.id}">Edit</button>
    <button class="delete-btn btn btn-sm btn-danger" data-id="${todo.id}">Delete</button>
`;
    return todoItem;
}

function addTodoToList(todo) {
    const todoItem = createTodo(todo);
    const todolist = document.getElementById("todo-list");
    todolist.appendChild(todoItem);
}

document.getElementById("add-btn").addEventListener("click", () => {
    const inputField = document.getElementById("new-todo");
    const title = inputField.value.trim();

    if (!title) {
        alert("Please enter a todo title.");
        return;
    }

    const todo = {
        Title: title,
        createdAt: new Date().toISOString(),
        completed: false,
    };

    addTodoToList(todo);
    inputField.value = "";
});

// Fetch and display todos on page load
getTodos().then(displayTodos).catch(error => {
    console.error("Error fetching todos:", error);
});

document.getElementById('clear-completed').addEventListener('click', () => {
    getCompletedTodos().then(completedTodos => {
        const deleteAllCompleted = completedTodos.map(todo => deleteTodo(todo.id));
        Promise.all(deleteAllCompleted)
            .then(() => getTodos())
            .then(displayTodos)
            .catch(error => console.error('Error clearing completed todos:', error));
    });
});

document.addEventListener('change', (event) => {
    if (event.target.classList.contains('complete-checkbox')) {
        const checkbox = event.target;
        const todoItem = checkbox.closest('li');
        const todoId = todoItem.dataset.id;
        const isCompleted = checkbox.checked;
        const updateTodoStatus = isCompleted ? completeTodo : uncompleteTodo;

        updateTodoStatus(todoId)
            .then(() => {
                const textDiv = todoItem.querySelector('div');
                if (isCompleted) {
                    textDiv.classList.add('text-decoration-line-through', 'text-muted');
                } else {
                    textDiv.classList.remove('text-decoration-line-through', 'text-muted');
                }
            })
            .catch((error) => {
                console.error('Error updating todo:', error);
            });
    }
});