
const Todo_Api="https://681902705a4b07b9d1d1ab77.mockapi.io/Todo/"

export async function getTodos() {
    const response = await fetch(Todo_Api); 
    if (!response.ok) {
        console.error("Failed to fetch todos:", response.status, response.statusText);
        return []; 
    }
    const data = await response.json();
    return data;
}

export async function getTodo(id) {
    const response = await fetch(Todo_Api + id); 
    if (!response.ok) {
        console.error("Failed to fetch todo:", response.status, response.statusText);
        return null; 
    }
    const data = await response.json();
    return data;
}

export async function createTodo(todo) {
    const response = await fetch(Todo_Api, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    });
    const data = await response.json();
    return data;
}
    
    
export async function updateTodo(id, todo) {
    const response = await fetch(Todo_Api + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    });
    const data = await response.json();
    return data;
}

export async function deleteTodo(id) {
    const response = await fetch(Todo_Api + id, {
        method: "DELETE",
    });
    if (!response.ok) {
        console.error("Failed to delete todo:", response.status, response.statusText);
        return null; 
    }
    return id;
}

export async function completeTodo(id) {
    const response = await fetch(Todo_Api + id, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
    });
    const data = await response.json();
    return data;
}

export async function uncompleteTodo(id) {
    const response = await fetch(Todo_Api + id, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: false }),
    });
    const data = await response.json();
    return data;
}


