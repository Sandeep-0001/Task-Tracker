(function () {
  const STORAGE_KEY = 'todos-v1';
  /** @type {{id:string,text:string,completed:boolean,createdAt:number}[]} */
  let todos = [];
  let currentFilter = 'all'; // all | active | completed

  // Elements
  const input = document.getElementById('new-todo');
  const addBtn = document.getElementById('add-btn');
  const listEl = document.getElementById('todo-list');
  const itemsLeftEl = document.getElementById('items-left');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const clearCompletedBtn = document.getElementById('clear-completed');

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
    } catch (e) {
      todos = [];
    }
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.unshift({ id: uid(), text: trimmed, completed: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggleComplete(id) {
    const t = todos.find(t => t.id === id);
    if (!t) return;
    t.completed = !t.completed;
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function updateText(id, newText) {
    const t = todos.find(t => t.id === id);
    if (!t) return;
    const clean = newText.trim();
    if (!clean) {
      deleteTodo(id);
      return;
    }
    t.text = clean;
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    save();
    render();
  }

  function setFilter(name) {
    currentFilter = name;
    filterButtons.forEach(b => b.classList.toggle('is-active', b.dataset.filter === currentFilter));
    render();
  }

  function filteredTodos() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function itemsLeft() {
    return todos.filter(t => !t.completed).length;
  }

  function createItemElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleComplete(todo.id));

    const title = document.createElement('div');
    title.className = 'todo-title' + (todo.completed ? ' completed' : '');
    title.textContent = todo.text;
    title.setAttribute('role', 'textbox');
    title.setAttribute('aria-label', 'Edit todo');
    title.tabIndex = 0;

    // Inline edit on double click or Enter
    function enableEdit() {
      if (todo.completed) return; // avoid editing completed
      title.contentEditable = 'true';
      title.focus();
      document.execCommand && document.execCommand('selectAll', false, null);
    }

    title.addEventListener('dblclick', enableEdit);
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        title.blur();
      } else if (e.key === 'Escape') {
        title.textContent = todo.text;
        title.blur();
      }
    });
    title.addEventListener('blur', () => {
      if (title.isContentEditable) {
        title.contentEditable = 'false';
        updateText(todo.id, title.textContent || '');
      }
    });

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', enableEdit);

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn delete';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.append(editBtn, delBtn);

    li.append(checkbox, title, actions);
    return li;
  }

  function render() {
    listEl.innerHTML = '';
    const items = filteredTodos();
    for (const todo of items) {
      listEl.appendChild(createItemElement(todo));
    }
    const left = itemsLeft();
    itemsLeftEl.textContent = `${left} item${left === 1 ? '' : 's'} left`;
  }

  // Wire up UI
  addBtn.addEventListener('click', () => addTodo(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo(input.value);
  });
  listEl.addEventListener('click', (e) => {
    // event delegation if needed in future
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Init
  load();
  render();
})();
