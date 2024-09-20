// Referências aos elementos
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const filterTasks = document.getElementById('filterTasks');
const toggleTheme = document.getElementById('toggleTheme');

// Verifica se há tarefas no localStorage ou popula com tarefas fictícias
const defaultTasks = [
    { text: "Construir uma casinha na árvore", completed: false },
    { text: "Assistir futebol", completed: false },
    { text: "Roubar um banco", completed: true }
];

let tasks = JSON.parse(localStorage.getItem('tasks')) || defaultTasks;

// Carrega o tema do localStorage ou define como claro por padrão
let currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
toggleTheme.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

// Função para salvar as tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Função para adicionar uma tarefa
function addTask(text) {
    tasks.push({ text, completed: false });
    saveTasks();
    renderTasks();
}

// Função para remover uma tarefa
function removeTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Função para marcar uma tarefa como concluída
function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// Função para renderizar a lista de tarefas
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';

        const span = document.createElement('span');
        span.textContent = task.text;
        span.tabIndex = 0; // Garantir foco para navegação por teclado
        span.onclick = () => toggleTaskCompletion(index);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remover';
        removeBtn.className = 'remove';
        removeBtn.onclick = () => removeTask(index);

        li.appendChild(span);
        li.appendChild(removeBtn);
        taskList.appendChild(li);
    });
}

// Filtra as tarefas com base no texto de entrada
filterTasks.addEventListener('input', () => {
    const query = filterTasks.value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(query));
    taskList.innerHTML = '';
    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';

        const span = document.createElement('span');
        span.textContent = task.text;
        span.tabIndex = 0; // Garantir foco para navegação por teclado
        span.onclick = () => toggleTaskCompletion(index);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remover';
        removeBtn.className = 'remove';
        removeBtn.onclick = () => removeTask(index);

        li.appendChild(span);
        li.appendChild(removeBtn);
        taskList.appendChild(li);
    });
});

// Alterna o tema e salva a escolha no localStorage
toggleTheme.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    toggleTheme.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

// Adiciona a tarefa ao enviar o formulário
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
    }
});

// Renderiza as tarefas inicialmente
renderTasks();
