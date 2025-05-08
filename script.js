import { getTodos, createTodo, completeTodo, uncompleteTodo, deleteTodo, updateTodo } from "./api/api.js";


getTodos()
    .then(displayTodos)
    .catch((error) => {
        console.error("Error fetching todos:", error);
    });

function displayTodos(todos) {
    const todolist = document.getElementById("todo-list");
    todolist.innerHTML = "";
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo); // Use the standalone createTodo function
        todolist.appendChild(todoItem);
    });
    updateItemCount(); 
}

function createTodoElement(todo) {
    const todoItem = document.createElement("li");
    todoItem.dataset.id = todo.id;
    todoItem.className = "list-group-item d-flex align-items-center justify-content-between";
    todoItem.innerHTML = `
        <input type="checkbox" class="form-check-input me-3 complete-checkbox" ${todo.completed ? 'checked' : ''}>
        <div class="flex-grow-1">
            <strong class="${todo.completed ? 'text-decoration-line-through text-muted' : ''}">${todo.Title}</strong><br>
            <small class="text-muted">Created At: ${new Date(todo.createdAt).toLocaleString()}</small>
        </div>
        <button class="edit-btn btn btn-sm btn-warning me-2" data-id="${todo.id}">
            <i class="bi bi-pencil"></i> <!-- Ícone de caneta -->
        </button>
        <button class="delete-btn btn btn-sm btn-danger" data-id="${todo.id}">
            <i class="bi bi-trash"></i> <!-- Ícone de lixo -->
        </button>
    `;
    return todoItem;
}


function addTodoToList(todo) {
    const todoItem = createTodoElement(todo);
    const todolist = document.getElementById("todo-list");
    todolist.appendChild(todoItem);
    updateItemCount(); // Update item count after adding a todo
}

function updateItemCount() {
    const todolist = document.getElementById("todo-list");
    const itemCount = todolist.childElementCount; 
    const itemCountSpan = document.getElementById("item-count");
    itemCountSpan.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`; 
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


document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const todoItem = event.target.closest('li');
        const todoId = todoItem.dataset.id;

        deleteTodo(todoId)
            .then(() => {
                todoItem.remove();
                updateItemCount(); // Update item count after deleting a todo
            })
            .catch((error) => {
                console.error('Error deleting todo:', error);
            });
    }
    if (event.target.classList.contains("edit-btn")) {
        const todoItem = event.target.closest("li");
        const todoId = todoItem.dataset.id;
        const titleDiv = todoItem.querySelector("strong");
        const currentTitle = titleDiv.textContent;

        // Substituir o título por um campo de entrada
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = currentTitle;
        inputField.className = "form-control me-2"; // Estilo Bootstrap
        titleDiv.replaceWith(inputField);

        // Alterar o botão "Edit" para "Save"
        const editButton = event.target;
        editButton.textContent = "Save";
        editButton.classList.remove("btn-warning");
        editButton.classList.add("btn-success");

        editButton.addEventListener("click", () => {
            const newTitle = inputField.value.trim();

            if (newTitle === "") {
                alert("The title cannot be empty.");
                return;
            }

            const updatedTodo = {
                Title: newTitle,
                createdAt: new Date().toISOString(),
                completed: todoItem.querySelector(".complete-checkbox").checked,
            };

            updateTodo(todoId, updatedTodo)
                .then(() => {
                    // Substituir o campo de entrada pelo novo título
                    const newTitleDiv = document.createElement("strong");
                    newTitleDiv.textContent = newTitle;
                    inputField.replaceWith(newTitleDiv);

                    // Alterar o botão "Save" de volta para "Edit"
                    editButton.textContent = "Edit";
                    editButton.classList.remove("btn-success");
                    editButton.classList.add("btn-warning");
                })
                .catch((error) => {
                    console.error("Error updating todo:", error);
                });
        }, { once: true });
    }
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
                const titleElement = todoItem.querySelector('strong');
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


