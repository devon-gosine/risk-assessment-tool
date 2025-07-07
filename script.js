
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
      taskRow.innerHTML += renderHazardCols(task.id, first);
    } else {
      taskRow.innerHTML += '<td colspan="4">No hazards identified</td>';
    }
    tbody.appendChild(taskRow);
    task.hazards.slice(1).forEach(h => {
      const row = document.createElement('tr');
      row.innerHTML = renderHazardCols(task.id, h);
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
  return `
    <td>
      <span id="hazard-desc-${hazard.id}">${hazard.description}</span><br/>
      <button onclick="editHazard(${taskId}, ${hazard.id})" aria-label="Edit hazard">✏️</button>
      <button onclick="deleteHazard(${taskId}, ${hazard.id})" aria-label="Delete hazard">🗑️</button>
    </td>
    <td>
      <select onchange="updateRisk(${taskId}, ${hazard.id}, 'initSeverity', this.value)">
        ${[1,2,3,4,5].map(n => `<option value="${n}" ${n==hazard.initSeverity?'selected':''}>${n}</option>`).join('')}
      </select>
      <select onchange="updateRisk(${taskId}, ${hazard.id}, 'initLikelihood', this.value)">
        ${['A','B','C','D','E'].map(l => `<option value="${l}" ${l==hazard.initLikelihood?'selected':''}>${l}</option>`).join('')}
      </select>
      <span class="risk-tag ${getRiskClass(hazard.initSeverity, hazard.initLikelihood)}" aria-label="${getRiskLevel(hazard.initSeverity, hazard.initLikelihood)} Risk">${hazard.initSeverity}${hazard.initLikelihood}</span>
    </td>
    <td>
      <button onclick="toggleControls(${taskId}, ${hazard.id})">${hazard.expanded ? 'Hide' : 'Show'} Controls</button>
      ${hazard.expanded ? `
      <ul class="controls-list">
        ${hazard.controls.map((c, i) => `<li>${c} <button onclick="editControl(${taskId},${hazard.id},${i})" aria-label="Edit control">✏️</button> <button onclick="deleteControl(${taskId},${hazard.id},${i})" aria-label="Delete control">🗑️</button></li>`).join('')}
      </ul>
      <input id="control-${taskId}-${hazard.id}" placeholder="Add control measure" />
      <button onclick="addControl(${taskId}, ${hazard.id})">Add Control</button>
      ` : ''}
    </td>
    <td>
      <select onchange="updateResidualRisk(${taskId}, ${hazard.id}, 'severity', this.value)">
        ${[1,2,3,4,5].map(n => `<option value="${n}" ${n==hazard.residualSeverity?'selected':''}>${n}</option>`).join('')}
      </select>
      <select onchange="updateResidualRisk(${taskId}, ${hazard.id}, 'likelihood', this.value)">
        ${['A','B','C','D','E'].map(l => `<option value="${l}" ${l==hazard.residualLikelihood?'selected':''}>${l}</option>`).join('')}
      </select>
      <span class="risk-tag ${getRiskClass(hazard.residualSeverity, hazard.residualLikelihood)}" aria-label="${getRiskLevel(hazard.residualSeverity, hazard.residualLikelihood)} Risk">${hazard.residualSeverity}${hazard.residualLikelihood}</span>
    </td>
  `;
}
