// ================================================================
// DYNAMIC PORTFOLIO - Hidden Shield Hotspot Admin Access
// ================================================================

// ADMIN PASSWORD
const ADMIN_PASSWORD = 'portfolio2028';

// Edit mode flag
let isEditMode = false;

// Currently edited item: { type: 'project'|'skill'|'cert'|'workshop', id, isDefault }
let editingTarget = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePortfolio();
    checkEditModeStatus();
});

function initializePortfolio() {
    applyDefaultProjectEdits();
    applyDefaultCertEdits();
    applyDefaultWorkshopEdits();
    applyDefaultSkillEdits();
    loadDeletedDefaults();
    loadCustomSkills();
    loadCustomProjects();
    loadAllCertifications();
    loadAllWorkshops();
    setupEventListeners();
    initializeEditControls();
}

// ================================================================
// SHARED STORAGE HELPERS (same keys, no duplicate systems)
// ================================================================

function readStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
        console.warn('Bad data in localStorage key:', key, err);
        return fallback;
    }
}

function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Overrides for the hard-coded default items (same pattern as deletedDefault*)
const EDIT_KEYS = {
    project: 'editedDefaultProjects',
    skill: 'editedDefaultSkills',
    cert: 'editedDefaultCerts',
    workshop: 'editedDefaultWorkshops'
};

function getDefaultEdits(type) {
    return readStore(EDIT_KEYS[type], {}) || {};
}

function saveDefaultEdit(type, id, data) {
    const edits = getDefaultEdits(type);
    edits[id] = { ...(edits[id] || {}), ...data };
    writeStore(EDIT_KEYS[type], edits);
}

// ================================================================
// DELETED ITEMS TRACKING
// ================================================================

function loadDeletedDefaults() {
    const deletedSkills = readStore('deletedDefaultSkills', []);
    const deletedProjects = readStore('deletedDefaultProjects', []);
    const deletedCerts = readStore('deletedDefaultCerts', []);
    const deletedWorkshops = readStore('deletedDefaultWorkshops', []);

    deletedSkills.forEach(skillId => {
        const element = document.querySelector(`[data-skill-id="${skillId}"]`);
        if (element) element.style.display = 'none';
    });

    deletedProjects.forEach(projId => {
        const element = document.querySelector(`[data-project-id="${projId}"]`);
        if (element) element.style.display = 'none';
    });

    deletedCerts.forEach(certId => {
        const element = document.querySelector(`[data-cert-id="${certId}"]`);
        if (element) element.style.display = 'none';
    });

    deletedWorkshops.forEach(workshopId => {
        const element = document.querySelector(`[data-workshop-id="${workshopId}"]`);
        if (element) element.style.display = 'none';
    });
}

// ================================================================
// HIDDEN HOTSPOT - Trigger Admin Mode
// ================================================================

function triggerAdminMode() {
    if (!isEditMode) {
        document.getElementById('passwordModal').classList.add('show');
        document.getElementById('adminPassword').focus();
    }
}

// ================================================================
// ADMIN & SECURITY
// ================================================================

function verifyPassword() {
    const password = document.getElementById('adminPassword').value;

    if (password === ADMIN_PASSWORD) {
        closePasswordModal();
        enterEditMode();
        showNotification('✅ Edit mode activated!');
    } else {
        showNotification('❌ Incorrect password!');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('show');
    document.getElementById('adminPassword').value = '';
}

function enterEditMode() {
    isEditMode = true;
    localStorage.setItem('editMode', 'true');

    const addSkillBtn = document.getElementById('addSkillBtn');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addCertBtn = document.getElementById('addCertBtn');
    const addWorkshopBtn = document.getElementById('addWorkshopBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (addSkillBtn) addSkillBtn.classList.add('show');
    if (addProjectBtn) addProjectBtn.classList.add('show');
    if (addCertBtn) addCertBtn.classList.add('show');
    if (addWorkshopBtn) addWorkshopBtn.classList.add('show');
    if (logoutBtn) logoutBtn.style.display = 'block';

    document.body.classList.add('edit-mode-active');
    showAllDeleteButtons();
}

function exitEditMode() {
    isEditMode = false;
    localStorage.removeItem('editMode');

    const addSkillBtn = document.getElementById('addSkillBtn');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addCertBtn = document.getElementById('addCertBtn');
    const addWorkshopBtn = document.getElementById('addWorkshopBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (addSkillBtn) addSkillBtn.classList.remove('show');
    if (addProjectBtn) addProjectBtn.classList.remove('show');
    if (addCertBtn) addCertBtn.classList.remove('show');
    if (addWorkshopBtn) addWorkshopBtn.classList.remove('show');
    if (logoutBtn) logoutBtn.style.display = 'none';

    document.body.classList.remove('edit-mode-active');
    hideAllDeleteButtons();
    showNotification('🔒 Logged out!');
}

function checkEditModeStatus() {
    if (localStorage.getItem('editMode') === 'true') {
        isEditMode = true;

        const addSkillBtn = document.getElementById('addSkillBtn');
        const addProjectBtn = document.getElementById('addProjectBtn');
        const addCertBtn = document.getElementById('addCertBtn');
        const addWorkshopBtn = document.getElementById('addWorkshopBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (addSkillBtn) addSkillBtn.classList.add('show');
        if (addProjectBtn) addProjectBtn.classList.add('show');
        if (addCertBtn) addCertBtn.classList.add('show');
        if (addWorkshopBtn) addWorkshopBtn.classList.add('show');
        if (logoutBtn) logoutBtn.style.display = 'block';

        document.body.classList.add('edit-mode-active');
        showAllDeleteButtons();
        showNotification('✅ Edit mode restored!');
    }
}

// Shows every admin control (delete + edit). Name kept for compatibility.
function showAllDeleteButtons() {
    document.querySelectorAll('.btn-delete-skill, .btn-edit-skill').forEach(btn => {
        btn.style.display = 'inline-block';
    });
    document.querySelectorAll('.btn-delete-project, .btn-edit-project').forEach(btn => {
        btn.style.display = 'block';
    });
    document.querySelectorAll('.btn-delete-cert, .btn-edit-cert, .btn-delete-workshop, .btn-edit-workshop')
        .forEach(btn => btn.classList.add('show'));
}

function hideAllDeleteButtons() {
    document.querySelectorAll('.btn-delete-skill, .btn-edit-skill, .btn-delete-project, .btn-edit-project')
        .forEach(btn => { btn.style.display = 'none'; });
    document.querySelectorAll('.btn-delete-cert, .btn-edit-cert, .btn-delete-workshop, .btn-edit-workshop')
        .forEach(btn => btn.classList.remove('show'));
}

function refreshAdminControls() {
    if (isEditMode) {
        showAllDeleteButtons();
    } else {
        hideAllDeleteButtons();
    }
}

function initializeEditControls() {
    refreshAdminControls();
}

// ================================================================
// SKILL MANAGEMENT
// ================================================================

function openAddSkillModal() {
    editingTarget = null;
    document.getElementById('skillModalTitle').textContent = 'Add New Skill';
    document.getElementById('skillModalSubmit').textContent = 'Add Skill';
    document.getElementById('skillCategory').value = '';
    document.getElementById('skillName').value = '';
    document.getElementById('addSkillModal').classList.add('show');
    document.getElementById('skillCategory').focus();
}

function closeAddSkillModal() {
    // Cancel: nothing is saved.
    editingTarget = null;
    document.getElementById('addSkillModal').classList.remove('show');
    document.getElementById('skillModalTitle').textContent = 'Add New Skill';
    document.getElementById('skillModalSubmit').textContent = 'Add Skill';
    document.getElementById('skillCategory').value = '';
    document.getElementById('skillName').value = '';
}

function openEditSkillModal(skillId) {
    const id = String(skillId);
    const isDefault = !id.startsWith('custom-');
    let category = '';
    let skillName = '';

    if (isDefault) {
        const el = document.querySelector(`[data-skill-id="${id}"]`);
        if (!el) return;
        const label = el.querySelector('.skill-tag-label');
        skillName = (label ? label.textContent : el.textContent).trim();
        const categoryBlock = el.closest('.skill-category, .skill-category-custom');
        const heading = categoryBlock ? categoryBlock.querySelector('h3') : null;
        category = heading ? heading.textContent.trim() : '';
    } else {
        // Custom skill - find by exact ID in storage
        const skill = readStore('customSkills', []).find(s => s.id === id);
        if (!skill) return;
        category = skill.category;
        skillName = skill.skillName;
    }

    editingTarget = { type: 'skill', id, isDefault };
    document.getElementById('skillModalTitle').textContent = 'Edit Skill';
    document.getElementById('skillModalSubmit').textContent = 'Save Changes';
    document.getElementById('skillCategory').value = category;
    document.getElementById('skillName').value = skillName;
    document.getElementById('addSkillModal').classList.add('show');
    document.getElementById('skillName').focus();
}

function submitSkillModal() {
    if (editingTarget && editingTarget.type === 'skill') {
        saveSkillEdit();
    } else {
        addNewSkill();
    }
}

function addNewSkill() {
    const category = document.getElementById('skillCategory').value.trim();
    const skillName = document.getElementById('skillName').value.trim();

    if (!category || !skillName) {
        showNotification('❌ Please fill in all fields!');
        return;
    }

    // Generate unique ID for this skill
    const skillId = 'custom-' + Date.now();

    // Find or create the category in the skillsGrid
    const targetTags = findOrCreateSkillCategory(category);
    if (!targetTags) {
        showNotification('❌ Failed to add skill!');
        return;
    }

    // Create skill element with exact same structure as existing skills
    const skillElement = document.createElement('span');
    skillElement.className = 'skill-tag';
    skillElement.setAttribute('data-skill-id', skillId);
    skillElement.innerHTML = `
        <span class="skill-tag-label">${escapeHtml(skillName)}</span>
        <button class="btn-edit-skill" onclick="openEditSkillModal('${skillId}')" title="Edit" style="display: ${isEditMode ? 'inline-block' : 'none'};">✎</button>
        <button class="btn-delete-skill" onclick="deleteCustomSkill('${skillId}')" title="Delete" style="display: ${isEditMode ? 'inline-block' : 'none'};">×</button>
    `;
    
    // Add the skill to the category
    targetTags.appendChild(skillElement);

    // Save to localStorage for persistence
    const customSkills = readStore('customSkills', []);
    customSkills.push({ category, skillName, id: skillId });
    writeStore('customSkills', customSkills);

    closeAddSkillModal();
    refreshAdminControls();
    showNotification('✅ Skill added!');
}

function saveSkillEdit() {
    const category = document.getElementById('skillCategory').value.trim();
    const skillName = document.getElementById('skillName').value.trim();

    if (!category || !skillName) {
        showNotification('❌ Please fill in all fields!');
        return;
    }

    const target = editingTarget;

    if (target.isDefault) {
        saveDefaultEdit('skill', target.id, { category, skillName });
        applyDefaultSkillEdits();
    } else {
        // Custom skill - find by exact ID in storage
        const customSkills = readStore('customSkills', []);
        const skill = customSkills.find(s => s.id === target.id);
        if (!skill) {
            showNotification('❌ Skill not found!');
            return;
        }
        
        // If category changed, update the DOM
        if (skill.category !== category) {
            const el = document.querySelector(`[data-skill-id="${target.id}"]`);
            if (el) el.remove();
        }
        
        skill.category = category;
        skill.skillName = skillName;
        writeStore('customSkills', customSkills);
        loadCustomSkills();
    }

    closeAddSkillModal();
    refreshAdminControls();
    showNotification('✅ Skill updated!');
}

// Apply stored edits to the default (hard-coded) skill tags
function applyDefaultSkillEdits() {
    const edits = getDefaultEdits('skill');

    Object.entries(edits).forEach(([skillId, data]) => {
        const el = document.querySelector(`[data-skill-id="${skillId}"]`);
        if (!el) return;

        if (data.skillName) {
            let label = el.querySelector('.skill-tag-label');
            if (!label) {
                label = document.createElement('span');
                label.className = 'skill-tag-label';
                el.insertBefore(label, el.firstChild);
            }
            label.textContent = data.skillName;
        }

        if (data.category) {
            const currentBlock = el.closest('.skill-category, .skill-category-custom');
            const currentName = currentBlock?.querySelector('h3')?.textContent.trim();
            if (currentName !== data.category) {
                const targetTags = findOrCreateSkillCategory(data.category);
                if (targetTags) targetTags.appendChild(el);
            }
        }
    });

    cleanupEmptySkillCategories();
}

function findOrCreateSkillCategory(categoryName) {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return null;

    const existing = Array.from(grid.querySelectorAll('.skill-category'))
        .find(block => block.querySelector('h3')?.textContent.trim() === categoryName);
    if (existing) return existing.querySelector('.skill-tags');

    const block = document.createElement('div');
    block.className = 'skill-category';
    block.setAttribute('data-generated-category', 'true');
    block.innerHTML = `<h3>${escapeHtml(categoryName)}</h3><div class="skill-tags"></div>`;
    grid.appendChild(block);
    return block.querySelector('.skill-tags');
}

function cleanupEmptySkillCategories() {
    document.querySelectorAll('#skillsGrid .skill-category[data-generated-category]').forEach(block => {
        if (!block.querySelector('.skill-tag')) block.remove();
    });
}

function loadCustomSkills() {
    const customSkills = readStore('customSkills', []);
    
    // Remove any old skill elements with matching custom IDs (from previous loads)
    customSkills.forEach(skill => {
        const existing = document.querySelector(`[data-skill-id="${skill.id}"]`);
        if (existing) existing.remove();
    });

    // Add each custom skill to its category in the skillsGrid
    customSkills.forEach(skill => {
        const targetTags = findOrCreateSkillCategory(skill.category);
        if (!targetTags) return;

        const skillElement = document.createElement('span');
        skillElement.className = 'skill-tag';
        skillElement.setAttribute('data-skill-id', skill.id);
        skillElement.innerHTML = `
            <span class="skill-tag-label">${escapeHtml(skill.skillName)}</span>
            <button class="btn-edit-skill" onclick="openEditSkillModal('${skill.id}')" title="Edit" style="display: ${isEditMode ? 'inline-block' : 'none'};">✎</button>
            <button class="btn-delete-skill" onclick="deleteCustomSkill('${skill.id}')" title="Delete" style="display: ${isEditMode ? 'inline-block' : 'none'};">×</button>
        `;
        targetTags.appendChild(skillElement);
    });

    // Clean up empty generated categories
    cleanupEmptySkillCategories();
}

function deleteDefaultSkill(skillId, skillName) {
    if (confirm(`Delete ${skillName}?`)) {
        const deletedSkills = readStore('deletedDefaultSkills', []);
        if (!deletedSkills.includes(skillId)) {
            deletedSkills.push(skillId);
            writeStore('deletedDefaultSkills', deletedSkills);
        }

        const element = document.querySelector(`[data-skill-id="${skillId}"]`);
        if (element) element.style.display = 'none';
        cleanupEmptySkillCategories();
        showNotification('🗑️ Skill deleted!');
    }
}

function deleteCustomSkill(skillId) {
    if (confirm('Delete this skill?')) {
        // Remove from DOM
        const element = document.querySelector(`[data-skill-id="${skillId}"]`);
        if (element) element.remove();

        // Remove from storage
        let customSkills = readStore('customSkills', []);
        customSkills = customSkills.filter(s => s.id !== skillId);
        writeStore('customSkills', customSkills);

        // Cleanup empty categories
        cleanupEmptySkillCategories();
        refreshAdminControls();
        showNotification('🗑️ Skill deleted!');
    }
}

// ================================================================
// PROJECT MANAGEMENT
// ================================================================

function openAddProjectModal() {
    editingTarget = null;
    document.getElementById('projectModalTitle').textContent = 'Add New Project';
    document.getElementById('projectModalSubmit').textContent = 'Add Project';
    clearProjectFields();
    document.getElementById('addProjectModal').classList.add('show');
    document.getElementById('projectTitle').focus();
}

function clearProjectFields() {
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectFeatures').value = '';
    document.getElementById('projectTech').value = '';
}

function closeAddProjectModal() {
    // Cancel: nothing is saved.
    editingTarget = null;
    document.getElementById('addProjectModal').classList.remove('show');
    document.getElementById('projectModalTitle').textContent = 'Add New Project';
    document.getElementById('projectModalSubmit').textContent = 'Add Project';
    clearProjectFields();
}

function openEditProjectModal(projectId) {
    const id = String(projectId);
    const isDefault = !id.startsWith('custom-');
    let data;

    if (isDefault) {
        const card = document.querySelector(`.project-card[data-project-id="${id}"]`);
        if (!card) return;
        data = {
            title: card.querySelector('.project-header h3')?.textContent.trim() || '',
            description: card.querySelector('.project-description')?.textContent.trim() || '',
            features: Array.from(card.querySelectorAll('.project-features .feature')).map(f => f.textContent.trim()),
            tech: Array.from(card.querySelectorAll('.project-tech .tech-tag')).map(t => t.textContent.trim())
        };
    } else {
        const customId = Number(id.replace('custom-', ''));
        const project = readStore('customProjects', []).find(p => p.id === customId);
        if (!project) return;
        data = project;
    }

    editingTarget = { type: 'project', id, isDefault };
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('projectModalSubmit').textContent = 'Save Changes';
    document.getElementById('projectTitle').value = data.title || '';
    document.getElementById('projectDescription').value = data.description || '';
    document.getElementById('projectFeatures').value = (data.features || []).join(', ');
    document.getElementById('projectTech').value = (data.tech || []).join(', ');
    document.getElementById('addProjectModal').classList.add('show');
    document.getElementById('projectTitle').focus();
}

function submitProjectModal() {
    if (editingTarget && editingTarget.type === 'project') {
        saveProjectEdit();
    } else {
        addNewProject();
    }
}

function readProjectForm() {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const features = document.getElementById('projectFeatures').value.trim();
    const tech = document.getElementById('projectTech').value.trim();

    if (!title || !description || !features || !tech) {
        showNotification('❌ Please fill in all fields!');
        return null;
    }

    return {
        title,
        description,
        features: features.split(',').map(f => f.trim()).filter(Boolean),
        tech: tech.split(',').map(t => t.trim()).filter(Boolean)
    };
}

function addNewProject() {
    const data = readProjectForm();
    if (!data) return;

    const customProjects = readStore('customProjects', []);
    customProjects.push({ id: Date.now(), ...data });
    writeStore('customProjects', customProjects);

    closeAddProjectModal();
    loadCustomProjects();
    refreshAdminControls();
    showNotification('✅ Project added!');
}

function saveProjectEdit() {
    const data = readProjectForm();
    if (!data) return;

    const target = editingTarget;

    if (target.isDefault) {
        saveDefaultEdit('project', target.id, data);
        applyDefaultProjectEdits();
    } else {
        const customId = Number(target.id.replace('custom-', ''));
        const customProjects = readStore('customProjects', []);
        const index = customProjects.findIndex(p => p.id === customId);
        if (index === -1) {
            showNotification('❌ Project not found!');
            return;
        }
        customProjects[index] = { ...customProjects[index], ...data };
        writeStore('customProjects', customProjects);
        loadCustomProjects();
    }

    closeAddProjectModal();
    refreshAdminControls();
    showNotification('✅ Project updated!');
}

// Apply stored edits to the default (hard-coded) project cards
function applyDefaultProjectEdits() {
    const edits = getDefaultEdits('project');

    Object.entries(edits).forEach(([projectId, data]) => {
        const card = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
        if (!card) return;

        const heading = card.querySelector('.project-header h3');
        if (heading && data.title) heading.textContent = data.title;

        const description = card.querySelector('.project-description');
        if (description && data.description) description.textContent = data.description;

        const featuresBox = card.querySelector('.project-features');
        if (featuresBox && Array.isArray(data.features)) {
            featuresBox.innerHTML = data.features
                .map(f => `<span class="feature">${escapeHtml(f)}</span>`).join('');
        }

        const techBox = card.querySelector('.project-tech');
        if (techBox && Array.isArray(data.tech)) {
            techBox.innerHTML = data.tech
                .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
        }
    });
}

function loadCustomProjects() {
    const customProjects = readStore('customProjects', []);
    const container = document.getElementById('customProjectsContainer');

    container.innerHTML = '';

    customProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-project-id', `custom-${project.id}`);
        projectCard.innerHTML = `
            <button class="btn-edit-project" onclick="openEditProjectModal('custom-${project.id}')" title="Edit" style="display: ${isEditMode ? 'block' : 'none'};">✎</button>
            <button class="btn-delete-project" onclick="deleteCustomProject(${project.id})" title="Delete" style="display: ${isEditMode ? 'block' : 'none'};">×</button>
            <div class="project-header">
                <h3>${escapeHtml(project.title)}</h3>
            </div>
            <p class="project-description">${escapeHtml(project.description)}</p>
            <div class="project-features">
                ${(project.features || []).map(f => `<span class="feature">${escapeHtml(f)}</span>`).join('')}
            </div>
            <div class="project-tech">
                ${(project.tech || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
        `;
        container.appendChild(projectCard);
    });
}

function deleteDefaultProject(projectId) {
    if (confirm('Delete this project?')) {
        const deletedProjects = readStore('deletedDefaultProjects', []);
        if (!deletedProjects.includes(projectId)) {
            deletedProjects.push(projectId);
            writeStore('deletedDefaultProjects', deletedProjects);
        }

        const element = document.querySelector(`[data-project-id="${projectId}"]`);
        if (element) element.style.display = 'none';
        showNotification('🗑️ Project deleted!');
    }
}

function deleteProject(projectId) {
    const id = String(projectId);
    if (id.startsWith('custom-')) {
        deleteCustomProject(Number(id.replace('custom-', '')));
    } else {
        deleteDefaultProject(id);
    }
}

function deleteCustomProject(projectId) {
    if (confirm('Delete this project?')) {
        let customProjects = readStore('customProjects', []);
        customProjects = customProjects.filter(p => p.id !== Number(projectId));
        writeStore('customProjects', customProjects);
        loadCustomProjects();
        refreshAdminControls();
        showNotification('🗑️ Project deleted!');
    }
}

// ================================================================
// CERTIFICATION MANAGEMENT
// ================================================================

function openAddCertModal() {
    editingTarget = null;
    document.getElementById('certModalTitle').textContent = 'Add New Certification';
    document.getElementById('certModalSubmit').textContent = 'Add Certification';
    document.getElementById('certTitle').value = '';
    document.getElementById('certSubtitle').value = '';
    document.getElementById('addCertModal').classList.add('show');
    document.getElementById('certTitle').focus();
}

function closeAddCertModal() {
    // Cancel: nothing is saved.
    editingTarget = null;
    document.getElementById('addCertModal').classList.remove('show');
    document.getElementById('certModalTitle').textContent = 'Add New Certification';
    document.getElementById('certModalSubmit').textContent = 'Add Certification';
    document.getElementById('certTitle').value = '';
    document.getElementById('certSubtitle').value = '';
}

function openEditCertModal(certId) {
    const id = String(certId);
    const isDefault = id.startsWith('cert-');
    let title = '';
    let subtitle = '';

    if (isDefault) {
        const card = document.querySelector(`.cert-card[data-cert-id="${id}"]`);
        if (!card) return;
        title = card.querySelector('h3')?.textContent.trim() || '';
        subtitle = card.querySelector('.cert-subtitle, .cert-badge')?.textContent.trim() || '';
    } else {
        const cert = readStore('customCerts', []).find(c => String(c.id) === id);
        if (!cert) return;
        title = cert.title;
        subtitle = cert.subtitle || '';
    }

    editingTarget = { type: 'cert', id, isDefault };
    document.getElementById('certModalTitle').textContent = 'Edit Certification';
    document.getElementById('certModalSubmit').textContent = 'Save Changes';
    document.getElementById('certTitle').value = title;
    document.getElementById('certSubtitle').value = subtitle;
    document.getElementById('addCertModal').classList.add('show');
    document.getElementById('certTitle').focus();
}

function submitCertModal() {
    if (editingTarget && editingTarget.type === 'cert') {
        saveCertEdit();
    } else {
        addNewCertification();
    }
}

function addNewCertification() {
    const title = document.getElementById('certTitle').value.trim();
    const subtitle = document.getElementById('certSubtitle').value.trim();

    if (!title) {
        showNotification('❌ Please enter title!');
        return;
    }

    const customCerts = readStore('customCerts', []);
    customCerts.push({ id: Date.now(), title, subtitle });
    writeStore('customCerts', customCerts);

    closeAddCertModal();
    loadAllCertifications();
    refreshAdminControls();
    showNotification('✅ Certification added!');
}

function saveCertEdit() {
    const title = document.getElementById('certTitle').value.trim();
    const subtitle = document.getElementById('certSubtitle').value.trim();

    if (!title) {
        showNotification('❌ Please enter title!');
        return;
    }

    const target = editingTarget;

    if (target.isDefault) {
        saveDefaultEdit('cert', target.id, { title, subtitle });
        applyDefaultCertEdits();
    } else {
        const customCerts = readStore('customCerts', []);
        const cert = customCerts.find(c => String(c.id) === target.id);
        if (!cert) {
            showNotification('❌ Certification not found!');
            return;
        }
        cert.title = title;
        cert.subtitle = subtitle;
        writeStore('customCerts', customCerts);
        loadCustomCertifications();
    }

    closeAddCertModal();
    refreshAdminControls();
    showNotification('✅ Certification updated!');
}

function applyDefaultCertEdits() {
    const edits = getDefaultEdits('cert');

    Object.entries(edits).forEach(([certId, data]) => {
        const card = document.querySelector(`.cert-card[data-cert-id="${certId}"]`);
        if (!card) return;

        const heading = card.querySelector('h3');
        if (heading && data.title) heading.textContent = data.title;

        let sub = card.querySelector('.cert-subtitle, .cert-badge');
        if (!sub) {
            sub = document.createElement('p');
            sub.className = 'cert-subtitle';
            card.appendChild(sub);
        }
        sub.textContent = data.subtitle || '';
    });
}

function deleteCertification(certId) {
    const id = String(certId);
    if (confirm('Delete this certification?')) {
        if (id.startsWith('cert-')) {
            const deletedCerts = readStore('deletedDefaultCerts', []);
            if (!deletedCerts.includes(id)) {
                deletedCerts.push(id);
                writeStore('deletedDefaultCerts', deletedCerts);
            }
            const element = document.querySelector(`[data-cert-id="${id}"]`);
            if (element) element.style.display = 'none';
        } else {
            let customCerts = readStore('customCerts', []);
            customCerts = customCerts.filter(c => String(c.id) !== id);
            writeStore('customCerts', customCerts);
            loadCustomCertifications();
        }
        refreshAdminControls();
        showNotification('🗑️ Certification deleted!');
    }
}

function loadAllCertifications() {
    const defaultCerts = document.querySelectorAll('.cert-card[data-cert-id]');
    const deletedCerts = readStore('deletedDefaultCerts', []);

    defaultCerts.forEach(cert => {
        const certId = cert.getAttribute('data-cert-id');
        cert.style.display = deletedCerts.includes(certId) ? 'none' : 'block';
    });

    loadCustomCertifications();
}

function loadCustomCertifications() {
    const customCerts = readStore('customCerts', []);
    const container = document.getElementById('customCertificationsContainer');

    container.innerHTML = '';

    customCerts.forEach(cert => {
        const certCard = document.createElement('div');
        certCard.className = 'cert-card';
        certCard.setAttribute('data-cert-id', String(cert.id));
        certCard.innerHTML = `
            <button class="btn-edit-cert ${isEditMode ? 'show' : ''}" onclick="openEditCertModal('${cert.id}')" title="Edit">✎</button>
            <button class="btn-delete-cert ${isEditMode ? 'show' : ''}" onclick="deleteCertification('${cert.id}')" title="Delete">×</button>
            <h3>${escapeHtml(cert.title)}</h3>
            <p class="cert-subtitle">${escapeHtml(cert.subtitle || '')}</p>
        `;
        container.appendChild(certCard);
    });
}

// ================================================================
// WORKSHOP MANAGEMENT
// ================================================================

function openAddWorkshopModal() {
    editingTarget = null;
    document.getElementById('workshopModalTitle').textContent = 'Add New Workshop';
    document.getElementById('workshopModalSubmit').textContent = 'Add Workshop';
    document.getElementById('workshopTitle').value = '';
    document.getElementById('workshopDescription').value = '';
    document.getElementById('addWorkshopModal').classList.add('show');
    document.getElementById('workshopTitle').focus();
}

function closeAddWorkshopModal() {
    // Cancel: nothing is saved.
    editingTarget = null;
    document.getElementById('addWorkshopModal').classList.remove('show');
    document.getElementById('workshopModalTitle').textContent = 'Add New Workshop';
    document.getElementById('workshopModalSubmit').textContent = 'Add Workshop';
    document.getElementById('workshopTitle').value = '';
    document.getElementById('workshopDescription').value = '';
}

function openEditWorkshopModal(workshopId) {
    const id = String(workshopId);
    const isDefault = id.startsWith('workshop-');
    let title = '';
    let description = '';

    if (isDefault) {
        const item = document.querySelector(`.workshop-item[data-workshop-id="${id}"]`);
        if (!item) return;
        title = item.querySelector('h3')?.textContent.trim() || '';
        description = item.querySelector('p')?.textContent.trim() || '';
    } else {
        const workshop = readStore('customWorkshops', []).find(w => String(w.id) === id);
        if (!workshop) return;
        title = workshop.title;
        description = workshop.description || '';
    }

    editingTarget = { type: 'workshop', id, isDefault };
    document.getElementById('workshopModalTitle').textContent = 'Edit Workshop';
    document.getElementById('workshopModalSubmit').textContent = 'Save Changes';
    document.getElementById('workshopTitle').value = title;
    document.getElementById('workshopDescription').value = description;
    document.getElementById('addWorkshopModal').classList.add('show');
    document.getElementById('workshopTitle').focus();
}

function submitWorkshopModal() {
    if (editingTarget && editingTarget.type === 'workshop') {
        saveWorkshopEdit();
    } else {
        addNewWorkshop();
    }
}

function addNewWorkshop() {
    const title = document.getElementById('workshopTitle').value.trim();
    const description = document.getElementById('workshopDescription').value.trim();

    if (!title) {
        showNotification('❌ Please enter title!');
        return;
    }

    const customWorkshops = readStore('customWorkshops', []);
    customWorkshops.push({ id: Date.now(), title, description });
    writeStore('customWorkshops', customWorkshops);

    closeAddWorkshopModal();
    loadAllWorkshops();
    refreshAdminControls();
    showNotification('✅ Workshop added!');
}

function saveWorkshopEdit() {
    const title = document.getElementById('workshopTitle').value.trim();
    const description = document.getElementById('workshopDescription').value.trim();

    if (!title) {
        showNotification('❌ Please enter title!');
        return;
    }

    const target = editingTarget;

    if (target.isDefault) {
        saveDefaultEdit('workshop', target.id, { title, description });
        applyDefaultWorkshopEdits();
    } else {
        const customWorkshops = readStore('customWorkshops', []);
        const workshop = customWorkshops.find(w => String(w.id) === target.id);
        if (!workshop) {
            showNotification('❌ Workshop not found!');
            return;
        }
        workshop.title = title;
        workshop.description = description;
        writeStore('customWorkshops', customWorkshops);
        loadCustomWorkshops();
    }

    closeAddWorkshopModal();
    refreshAdminControls();
    showNotification('✅ Workshop updated!');
}

function applyDefaultWorkshopEdits() {
    const edits = getDefaultEdits('workshop');

    Object.entries(edits).forEach(([workshopId, data]) => {
        const item = document.querySelector(`.workshop-item[data-workshop-id="${workshopId}"]`);
        if (!item) return;

        const heading = item.querySelector('h3');
        if (heading && data.title) heading.textContent = data.title;

        let para = item.querySelector('p');
        if (!para) {
            para = document.createElement('p');
            item.appendChild(para);
        }
        para.textContent = data.description || '';
    });
}

function deleteWorkshop(workshopId) {
    const id = String(workshopId);
    if (confirm('Delete this workshop?')) {
        if (id.startsWith('workshop-')) {
            const deletedWorkshops = readStore('deletedDefaultWorkshops', []);
            if (!deletedWorkshops.includes(id)) {
                deletedWorkshops.push(id);
                writeStore('deletedDefaultWorkshops', deletedWorkshops);
            }
            const element = document.querySelector(`[data-workshop-id="${id}"]`);
            if (element) element.style.display = 'none';
        } else {
            let customWorkshops = readStore('customWorkshops', []);
            customWorkshops = customWorkshops.filter(w => String(w.id) !== id);
            writeStore('customWorkshops', customWorkshops);
            loadCustomWorkshops();
        }
        refreshAdminControls();
        showNotification('🗑️ Workshop deleted!');
    }
}

function loadAllWorkshops() {
    const defaultWorkshops = document.querySelectorAll('.workshop-item[data-workshop-id]');
    const deletedWorkshops = readStore('deletedDefaultWorkshops', []);

    defaultWorkshops.forEach(workshop => {
        const workshopId = workshop.getAttribute('data-workshop-id');
        workshop.style.display = deletedWorkshops.includes(workshopId) ? 'none' : 'block';
    });

    loadCustomWorkshops();
}

function loadCustomWorkshops() {
    const customWorkshops = readStore('customWorkshops', []);
    const container = document.getElementById('customWorkshopsContainer');

    container.innerHTML = '';

    customWorkshops.forEach(workshop => {
        const workshopItem = document.createElement('div');
        workshopItem.className = 'workshop-item';
        workshopItem.setAttribute('data-workshop-id', String(workshop.id));
        workshopItem.innerHTML = `
            <button class="btn-edit-workshop ${isEditMode ? 'show' : ''}" onclick="openEditWorkshopModal('${workshop.id}')" title="Edit">✎</button>
            <button class="btn-delete-workshop ${isEditMode ? 'show' : ''}" onclick="deleteWorkshop('${workshop.id}')" title="Delete">×</button>
            <h3>${escapeHtml(workshop.title)}</h3>
            <p>${escapeHtml(workshop.description || '')}</p>
        `;
        container.appendChild(workshopItem);
    });
}

// ================================================================
// NOTIFICATION SYSTEM
// ================================================================

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--color-accent);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInNotif 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutNotif 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ================================================================
// MODAL CONTROLS
// ================================================================

window.addEventListener('click', (e) => {
    const passwordModal = document.getElementById('passwordModal');
    const skillModal = document.getElementById('addSkillModal');
    const projectModal = document.getElementById('addProjectModal');
    const certModal = document.getElementById('addCertModal');
    const workshopModal = document.getElementById('addWorkshopModal');

    if (e.target === passwordModal) closePasswordModal();
    if (e.target === skillModal) closeAddSkillModal();
    if (e.target === projectModal) closeAddProjectModal();
    if (e.target === certModal) closeAddCertModal();
    if (e.target === workshopModal) closeAddWorkshopModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePasswordModal();
        closeAddSkillModal();
        closeAddProjectModal();
        closeAddCertModal();
        closeAddWorkshopModal();
    }
});

document.addEventListener('keypress', (e) => {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal?.classList.contains('show') && e.key === 'Enter') {
        verifyPassword();
    }
});

// ================================================================
// ANIMATION STYLES
// ================================================================

const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInNotif {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutNotif {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(animationStyles);

// ================================================================
// RESUME DOWNLOAD
// ================================================================

function downloadResume() {
    // Google Drive link with export parameter for PDF download
    const resumeUrl = 'https://drive.google.com/uc?export=download&id=1c8dObURfrcilDbXPD1rfoAp3IWzL3_Rb';
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'Kaviyarasi_S_Resume.pdf';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📥 Resume downloading...');
}

// ================================================================
// SETUP EVENT LISTENERS
// ================================================================

function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Could add more shortcuts here if needed
    });
}