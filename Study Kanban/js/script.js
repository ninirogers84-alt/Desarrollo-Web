
let tasks = [
    {
        id: 1,
        title: "Entrega informe de Design Thinking",
        subject: "Design Thinking",
        priority: "alta",
        status: "todo",
        date: "2026-06-10"
    },
    {
        id: 2,
        title: "Revisar apuntes para examen",
        subject: "Programación",
        priority: "media",
        status: "todo",
        date: "2026-06-11"
    },
    {
        id: 3,
        title: "Preparar presentación final para Narrativas",
        subject: "Diseño narrativo de videojuegos",
        priority: "alta",
        status: "doing",
        date: "2026-06-12"
    },
    {
        id: 4,
        title: "Ejercitar c#",
        subject: "Programación",
        priority: "media",
        status: "done",
        date: "2026-06-09"
    },
    {
        id: 5,
        title: "Investigar para ensayo de administración",
        subject: "Administracion organizacional sustentable",
        priority: "baja",
        status: "todo",
        date: "2026-06-13"
    },
    {
        id: 6,
        title: "Reunion de grupo para proyecto final",
        subject: "Ciberseguridad",
        priority: "alta",
        status: "doing",
        date: "2026-06-10"
    }
];

let currentFilter = "all";
let draggedTaskId = null;

const todoList = document.getElementById("todoList");
const doingList = document.getElementById("doingList");
const doneList = document.getElementById("doneList");
const todoCount = document.getElementById("todoCount");
const doingCount = document.getElementById("doingCount");
const doneCount = document.getElementById("doneCount");
const totalTasksSpan = document.getElementById("totalTasks");
const completedTasksSpan = document.getElementById("completedTasks");
const progressPercentSpan = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");

// Modal elements
const modal = document.getElementById("taskModal");
const addTaskBtn = document.getElementById("addTaskBtn");
const closeModal = document.querySelector(".close-modal");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskTitleInput = document.getElementById("taskTitle");
const taskSubjectInput = document.getElementById("taskSubject");
const taskPrioritySelect = document.getElementById("taskPriority");
const taskDateInput = document.getElementById("taskDate");

function renderKanban() {
    todoList.innerHTML = "";
    doingList.innerHTML = "";
    doneList.innerHTML = "";

    let filteredTasks = tasks;
    if (currentFilter !== "all") {
        filteredTasks = tasks.filter(task => task.priority === currentFilter);
    }

    const todoTasks = filteredTasks.filter(task => task.status === "todo");
    const doingTasks = filteredTasks.filter(task => task.status === "doing");
    const doneTasks = filteredTasks.filter(task => task.status === "done");

    todoTasks.forEach(task => renderTaskCard(task, todoList));
    doingTasks.forEach(task => renderTaskCard(task, doingList));
    doneTasks.forEach(task => renderTaskCard(task, doneList));

    updateCounters();
}

function renderTaskCard(task, container) {
    const taskCard = document.createElement("div");
    taskCard.className = `task-card priority-${task.priority}`;
    taskCard.setAttribute("data-id", task.id);
    taskCard.setAttribute("draggable", "true");
    
    const dateFormatted = task.date ? new Date(task.date).toLocaleDateString('es-ES') : "Sin fecha";
    
    taskCard.innerHTML = `
        <div class="task-title">
            <span class="task-title-text">${escapeHtml(task.title)}</span>
            <button class="delete-task" data-id="${task.id}" title="Eliminar tarea">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        <div class="task-meta">
            <span class="task-subject"><i class="fas fa-book"></i> ${escapeHtml(task.subject)}</span>
            <span class="task-date"><i class="far fa-calendar-alt"></i> ${dateFormatted}</span>
            <span class="priority-badge">${getPriorityIcon(task.priority)} ${getPriorityText(task.priority)}</span>
        </div>
    `;
    
    taskCard.addEventListener("dragstart", handleDragStart);
    taskCard.addEventListener("dragend", handleDragEnd);
    
    const deleteBtn = taskCard.querySelector(".delete-task");
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    
    container.appendChild(taskCard);
}

function getPriorityIcon(priority) {
    switch(priority) {
        case "alta": return "🔴";
        case "media": return "🟡";
        case "baja": return "🟢";
        default: return "⚪";
    }
}

function getPriorityText(priority) {
    switch(priority) {
        case "alta": return "Alta";
        case "media": return "Media";
        case "baja": return "Baja";
        default: return "";
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function handleDragStart(e) {
    const taskCard = e.target.closest(".task-card");
    if (!taskCard) return;
    
    draggedTaskId = parseInt(taskCard.getAttribute("data-id"));
    e.dataTransfer.setData("text/plain", draggedTaskId);
    e.dataTransfer.effectAllowed = "move";
    taskCard.classList.add("dragging");
}

function handleDragEnd(e) {
    const taskCard = e.target.closest(".task-card");
    if (taskCard) {
        taskCard.classList.remove("dragging");
    }
    draggedTaskId = null;
    
    document.querySelectorAll(".kanban-col").forEach(col => {
        col.classList.remove("drag-over");
    });
}

function setupDragAndDrop() {
    const columns = document.querySelectorAll(".kanban-col");
    
    columns.forEach(col => {
        col.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            col.classList.add("drag-over");
        });
        
        col.addEventListener("dragleave", () => {
            col.classList.remove("drag-over");
        });
        
        col.addEventListener("drop", (e) => {
            e.preventDefault();
            col.classList.remove("drag-over");
            
            const newStatus = col.getAttribute("data-status");
            if (draggedTaskId !== null) {
                const task = tasks.find(t => t.id === draggedTaskId);
                if (task && task.status !== newStatus) {
                    task.status = newStatus;
                    renderKanban();
                    updateStats();
                }
            }
        });
    });
}

function addTask(title, subject, priority, date) {
    const newId = Date.now();
    const newTask = {
        id: newId,
        title: title,
        subject: subject || "General",
        priority: priority,
        status: "todo",
        date: date || new Date().toISOString().slice(0,10)
    };
    tasks.push(newTask);
    renderKanban();
    updateStats();
    showNotification("Tarea agregada correctamente");
}

function deleteTask(taskId) {
    if (confirm("¿Eliminar esta tarea?")) {
        tasks = tasks.filter(task => task.id !== taskId);
        renderKanban();
        updateStats();
        showNotification("Tarea eliminada");
    }
}

function updateCounters() {
    const todoTasks = tasks.filter(t => t.status === "todo").length;
    const doingTasks = tasks.filter(t => t.status === "doing").length;
    const doneTasks = tasks.filter(t => t.status === "done").length;
    
    todoCount.textContent = todoTasks;
    doingCount.textContent = doingTasks;
    doneCount.textContent = doneTasks;
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "done").length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    totalTasksSpan.textContent = total;
    completedTasksSpan.textContent = completed;
    progressPercentSpan.textContent = percent;
    progressFill.style.width = `${percent}%`;
}

function setupFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            currentFilter = btn.getAttribute("data-filter");
            renderKanban();
        });
    });
}

function setupModal() {
    // Abrir modal
    addTaskBtn.addEventListener("click", () => {
        taskTitleInput.value = "";
        taskSubjectInput.value = "";
        taskPrioritySelect.value = "media";
        const today = new Date().toISOString().slice(0,10);
        taskDateInput.value = today;
        modal.classList.add("show");
        taskTitleInput.focus();
    });
    
    const closeModalFn = () => {
        modal.classList.remove("show");
    };
    
    closeModal.addEventListener("click", closeModalFn);
    cancelModalBtn.addEventListener("click", closeModalFn);
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModalFn();
        }
    });
    
    saveTaskBtn.addEventListener("click", () => {
        const title = taskTitleInput.value.trim();
        const subject = taskSubjectInput.value.trim();
        const priority = taskPrioritySelect.value;
        const date = taskDateInput.value;
        
        if (!title) {
            alert("Por favor, ingresa un título para la tarea");
            taskTitleInput.focus();
            return;
        }
        
        addTask(title, subject || "General", priority, date);
        modal.classList.remove("show");
    });
    
    taskTitleInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            saveTaskBtn.click();
        }
    });
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "floating-notification";
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--text-dark);
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 40px;
        font-size: 0.85rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 300);
    }, 2500);
}

const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .drag-over {
        background: var(--pastel-blue);
        transition: background 0.1s ease;
    }
`;
document.head.appendChild(styleSheet);

function init() {
    renderKanban();
    updateStats();
    setupDragAndDrop();
    setupFilters();
    setupModal();

}

document.addEventListener("DOMContentLoaded", init);