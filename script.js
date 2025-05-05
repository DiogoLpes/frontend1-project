// DOM Elements
const newTodoInput = document.getElementById('new-todo');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filters = document.querySelectorAll('.filter');
const clearCompletedBtn = document.getElementById('clear-completed');
const itemCount = document.getElementById('item-count');
const themeButtons = document.querySelectorAll('.theme-btn');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize
renderTodos();
updateCount();

// Event Listeners
addBtn.addEventListener('click', addTodo);
newTodoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

filters.forEach(filter => {
    filter.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        currentFilter = filter.dataset.filter;
        renderTodos();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.body.className = button.dataset.theme;
        localStorage.setItem('theme', button.dataset.theme);
    });
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.className = savedTheme;
}

// Functions
function addTodo() {
    const text = newTodoInput.value.trim();
    if (text) {
        todos.push({
            id: Date.now(),
            text,
            completed: false
        });
        saveTodos();
        renderTodos();
        newTodoInput.value = '';
        updateCount();
    }
}

function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });
    
    if (filteredTodos.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'No todos found';
        empty.style.textAlign = 'center';
        empty.style.padding = '20px';
        empty.style.color = '#666';
        todoList.appendChild(empty);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) li.classList.add('completed');
        
        li.innerHTML = `
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <div class="todo-actions">
                <button class="complete-btn" data-id="${todo.id}">✓</button>
                <button class="edit-btn" data-id="${todo.id}">Edit</button>
                <button class="delete-btn" data-id="${todo.id}">X</button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
    
    // Add event listeners to new buttons
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleComplete(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editTodo(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTodo(btn.dataset.id));
    });
}

function toggleComplete(id) {
    todos = todos.map(todo => 
        todo.id == id ? {...todo, completed: !todo.completed} : todo
    );
    saveTodos();
    renderTodos();
    updateCount();
}

function editTodo(id) {
    const todo = todos.find(t => t.id == id);
    const newText = prompt('Edit your todo:', todo.text);
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id != id);
    saveTodos();
    renderTodos();
    updateCount();
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateCount();
}

function updateCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    itemCount.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'}`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}