
const riskMatrix = {
  '1A': 'Low', '1B': 'Low', '1C': 'Low', '1D': 'Medium', '1E': 'Medium',
  '2A': 'Low', '2B': 'Medium', '2C': 'Medium', '2D': 'High', '2E': 'High',
  '3A': 'Medium', '3B': 'Medium', '3C': 'High', '3D': 'High', '3E': 'Critical',
  '4A': 'High', '4B': 'High', '4C': 'Critical', '4D': 'Critical', '4E': 'Critical',
  '5A': 'Critical', '5B': 'Critical', '5C': 'Critical', '5D': 'Critical', '5E': 'Critical'
};

let tasks = [];
let currentTaskId = 1;

function addTask() {
  const desc = document.getElementById('taskDesc').value.trim();
  if (!desc) return;
  tasks.push({ id: currentTaskId++, description: desc, hazards: [] });
  document.getElementById('taskDesc').value = '';
  renderTable();
}

function addHazard(taskId) {
  const hazardDesc = document.getElementById(`hazardDesc-${taskId}`).value.trim();
  const severity = document.getElementById(`initSeverity-${taskId}`).value;
  const likelihood = document.getElementById(`initLikelihood-${taskId}`).value;
  if (!hazardDesc) return;
  const task = tasks.find(t => t.id === taskId);
  task.hazards.push({
    id: Date.now(),
    description: hazardDesc,
    initSeverity: severity,
    initLikelihood: likelihood,
    residualSeverity: severity,
    residualLikelihood: likelihood,
    controls: [],
    expanded: false
  });
  renderTable();
}

function toggleControls(taskId, hazardId) {
  const task = tasks.find(t => t.id === taskId);
  const hazard = task.hazards.find(h => h.id === hazardId);
  hazard.expanded = !hazard.expanded;
  renderTable();
}

function addControl(taskId, hazardId) {
  const input = document.getElementById(`control-${taskId}-${hazardId}`);
  const value = input.value.trim();
  if (!value) return;
  const task = tasks.find(t => t.id === taskId);
  const hazard = task.hazards.find(h => h.id === hazardId);
  hazard.controls.push(value);
  input.value = '';
  renderTable();
}

function updateResidualRisk(taskId, hazardId, type, value) {
  const task = tasks.find(t => t.id === taskId);
  const hazard = task.hazards.find(h => h.id === hazardId);
  hazard[type === 'severity' ? 'residualSeverity' : 'residualLikelihood'] = value;
  renderTable();
}

function getRiskClass(severity, likelihood) {
  const key = severity + likelihood;
  const level = riskMatrix[key] || 'Low';
  return level.toLowerCase() + '-risk';
}

function getRiskLevel(severity, likelihood) {
  const key = severity + likelihood;
  return riskMatrix[key] || 'Low';
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  tasks.forEach((task, i) => {
    const taskRow = document.createElement('tr');
    taskRow.innerHTML = `
      <td rowspan="${Math.max(task.hazards.length, 1) + 1}">${i + 1}</td>
      <td rowspan="${Math.max(task.hazards.length, 1) + 1}">${task.description}</td>
    `;
    if (task.hazards.length > 0) {
      const first = task.hazards[0];
      renderHazardCols(task.id, first).forEach(cell => taskRow.appendChild(cell));
    } else {
      const empty = document.createElement('td');
      empty.colSpan = 4;
      empty.textContent = 'No hazards identified';
      taskRow.appendChild(empty);
    }
    tbody.appendChild(taskRow);
    task.hazards.slice(1).forEach(h => {
      const row = document.createElement('tr');
      renderHazardCols(task.id, h).forEach(cell => row.appendChild(cell));
      tbody.appendChild(row);
    });
    const inputRow = document.createElement('tr');
    inputRow.className = 'hazard-input';
    inputRow.innerHTML = `
      <td colspan="4">
        <textarea id="hazardDesc-${task.id}" placeholder="Hazard description"></textarea>
        <div class="risk-selectors">
          <select id="initSeverity-${task.id}">${[1,2,3,4,5].map(n => `<option>${n}</option>`).join('')}</select>
          <select id="initLikelihood-${task.id}">${['A','B','C','D','E'].map(l => `<option>${l}</option>`).join('')}</select>
          <button onclick="addHazard(${task.id})">Add Hazard</button>
        </div>
      </td>
    `;
    tbody.appendChild(inputRow);
  });
}


function exportToJSON() {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'risk_assessment.json';
  link.click();
}

window.onload = renderTable;



function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  const newDesc = prompt("Edit Task Description:", task.description);
  if (newDesc !== null && newDesc.trim() !== '') {
    task.description = newDesc.trim();
    renderTable();
  }
}

function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTable();
  }
}

function editHazard(taskId, hazardId) {
  const task = tasks.find(t => t.id === taskId);
  const hazard = task.hazards.find(h => h.id === hazardId);
  const newDesc = prompt("Edit Hazard Description:", hazard.description);
  if (newDesc !== null && newDesc.trim() !== '') {
    hazard.description = newDesc.trim();
    renderTable();
  }
}

function deleteHazard(taskId, hazardId) {
  const task = tasks.find(t => t.id === taskId);
  if (confirm("Are you sure you want to delete this hazard?")) {
    task.hazards = task.hazards.filter(h => h.id !== hazardId);
    renderTable();
  }
}

function editControl(taskId, hazardId, index) {
  const task = tasks.find(t => t.id === taskId);
  const hazard = task.hazards.find(h => h.id === hazardId);
  const newText = prompt("Edit Control Measure:", hazard.controls[index]);
  if (newText !== null && newText.trim() !== '') {
    hazard.controls[index] = newText.trim();
    renderTable();
  }
}

function deleteControl(taskId, hazardId, index) {
  const task = tasks.find(t => t.id === taskId);
  const hazard = task.hazards.find(h => h.id === hazardId);
  if (confirm("Delete this control measure?")) {
    hazard.controls.splice(index, 1);
    renderTable();
  }
}


function updateRisk(taskId, hazardId, type, value) {
  const task = tasks.find(t => t.id === taskId);
  const hazard = task.hazards.find(h => h.id === hazardId);
  if (type === 'initSeverity') hazard.initSeverity = value;
  else hazard.initLikelihood = value;
  renderTable();
}

// Updated renderHazardCols with editable dropdowns
function renderHazardCols(taskId, hazard) {
  const descTd = document.createElement('td');
  const descSpan = document.createElement('span');
  descSpan.id = `hazard-desc-${hazard.id}`;
  descSpan.textContent = hazard.description;
  descTd.appendChild(descSpan);
  descTd.appendChild(document.createElement('br'));

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.setAttribute('aria-label', 'Edit hazard');
  editBtn.onclick = () => editHazard(taskId, hazard.id);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.setAttribute('aria-label', 'Delete hazard');
  deleteBtn.onclick = () => deleteHazard(taskId, hazard.id);

  descTd.appendChild(editBtn);
  descTd.appendChild(deleteBtn);

  const initTd = document.createElement('td');
  const sevSelect = document.createElement('select');
  sevSelect.onchange = function() { updateRisk(taskId, hazard.id, 'initSeverity', this.value); };
  [1,2,3,4,5].forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = n;
    if (n == hazard.initSeverity) opt.selected = true;
    sevSelect.appendChild(opt);
  });

  const likeSelect = document.createElement('select');
  likeSelect.onchange = function() { updateRisk(taskId, hazard.id, 'initLikelihood', this.value); };
  ['A','B','C','D','E'].forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    if (l == hazard.initLikelihood) opt.selected = true;
    likeSelect.appendChild(opt);
  });

  const initSpan = document.createElement('span');
  initSpan.className = 'risk-tag ' + getRiskClass(hazard.initSeverity, hazard.initLikelihood);
  initSpan.setAttribute('aria-label', getRiskLevel(hazard.initSeverity, hazard.initLikelihood) + ' Risk');
  initSpan.textContent = hazard.initSeverity + hazard.initLikelihood;

  initTd.appendChild(sevSelect);
  initTd.appendChild(likeSelect);
  initTd.appendChild(initSpan);

  const controlsTd = document.createElement('td');
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = hazard.expanded ? 'Hide Controls' : 'Show Controls';
  toggleBtn.onclick = () => toggleControls(taskId, hazard.id);
  controlsTd.appendChild(toggleBtn);

  if (hazard.expanded) {
    const ul = document.createElement('ul');
    ul.className = 'controls-list';
    hazard.controls.forEach((c, i) => {
      const li = document.createElement('li');
      const text = document.createTextNode(c);
      li.appendChild(text);

      const editC = document.createElement('button');
      editC.textContent = '✏️';
      editC.setAttribute('aria-label', 'Edit control');
      editC.onclick = () => editControl(taskId, hazard.id, i);

      const delC = document.createElement('button');
      delC.textContent = '🗑️';
      delC.setAttribute('aria-label', 'Delete control');
      delC.onclick = () => deleteControl(taskId, hazard.id, i);

      li.appendChild(editC);
      li.appendChild(delC);
      ul.appendChild(li);
    });

    const input = document.createElement('input');
    input.id = `control-${taskId}-${hazard.id}`;
    input.placeholder = 'Add control measure';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Control';
    addBtn.onclick = () => addControl(taskId, hazard.id);

    controlsTd.appendChild(ul);
    controlsTd.appendChild(input);
    controlsTd.appendChild(addBtn);
  }

  const resTd = document.createElement('td');
  const resSev = document.createElement('select');
  resSev.onchange = function() { updateResidualRisk(taskId, hazard.id, 'severity', this.value); };
  [1,2,3,4,5].forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = n;
    if (n == hazard.residualSeverity) opt.selected = true;
    resSev.appendChild(opt);
  });

  const resLike = document.createElement('select');
  resLike.onchange = function() { updateResidualRisk(taskId, hazard.id, 'likelihood', this.value); };
  ['A','B','C','D','E'].forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    if (l == hazard.residualLikelihood) opt.selected = true;
    resLike.appendChild(opt);
  });

  const resSpan = document.createElement('span');
  resSpan.className = 'risk-tag ' + getRiskClass(hazard.residualSeverity, hazard.residualLikelihood);
  resSpan.setAttribute('aria-label', getRiskLevel(hazard.residualSeverity, hazard.residualLikelihood) + ' Risk');
  resSpan.textContent = hazard.residualSeverity + hazard.residualLikelihood;

  resTd.appendChild(resSev);
  resTd.appendChild(resLike);
  resTd.appendChild(resSpan);

  return [descTd, initTd, controlsTd, resTd];
}
