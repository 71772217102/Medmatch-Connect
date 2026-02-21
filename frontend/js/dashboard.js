const API_URL = 'http://localhost:8765/api';

let currentUser = null;
let freelancers = [];

// Check authentication on load
function init() {
    const token = localStorage.getItem('token');
    currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userName').textContent = currentUser.name;
    
    // Show appropriate dashboard based on role
    if (currentUser.role === 'patient') {
        document.getElementById('patientDashboard').style.display = 'block';
        loadPatientCases();
    } else if (currentUser.role === 'freelancer') {
        document.getElementById('freelancerDashboard').style.display = 'block';
        loadAvailableCases();
        loadFreelancerCases();
    } else if (currentUser.role === 'admin') {
        document.getElementById('adminDashboard').style.display = 'block';
        loadAllCases();
        loadAllUsers();
        loadFreelancersForAdmin();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Modal functions
function showCreateCase() {
    document.getElementById('createCaseModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('createCaseModal').style.display = 'none';
}

// Create new case
document.getElementById('createCaseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('insuranceProvider', document.getElementById('insuranceProvider').value);
    formData.append('policyNumber', document.getElementById('policyNumber').value);
    formData.append('description', document.getElementById('description').value);
    
    const documentFile = document.getElementById('document').files[0];
    if (documentFile) {
        formData.append('document', documentFile);
    }
    
    try {
        const response = await fetch(`${API_URL}/cases/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Case created successfully!');
            closeModal();
            loadPatientCases();
        } else {
            alert(data.message || 'Failed to create case');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Load patient cases
async function loadPatientCases() {
    try {
        const response = await fetch(`${API_URL}/cases/mycases`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const cases = await response.json();
        const casesList = document.getElementById('casesList');
        
        if (cases.length === 0) {
            casesList.innerHTML = '<p>No cases submitted yet.</p>';
            return;
        }
        
        casesList.innerHTML = cases.map(c => `
            <div class="case-card">
                <h4>${c.insuranceProvider}</h4>
                <p><strong>Policy:</strong> ${c.policyNumber}</p>
                <p><strong>Description:</strong> ${c.description}</p>
                <p><strong>Status:</strong> <span class="status status-${c.status}">${c.status}</span></p>
                ${c.freelancerId ? `<p><strong>Assigned to:</strong> ${c.freelancerId.name}</p>` : ''}
                <p><small>Created: ${new Date(c.createdAt).toLocaleDateString()}</small></p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading cases:', error);
    }
}

// Load available cases for freelancers
async function loadAvailableCases() {
    try {
        const response = await fetch(`${API_URL}/cases/available`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const cases = await response.json();
        const container = document.getElementById('availableCases');
        
        if (cases.length === 0) {
            container.innerHTML = '<p>No available cases.</p>';
            return;
        }
        
        container.innerHTML = cases.map(c => `
            <div class="case-card">
                <h4>${c.insuranceProvider}</h4>
                <p><strong>Policy:</strong> ${c.policyNumber}</p>
                <p><strong>Description:</strong> ${c.description}</p>
                <p><strong>Patient:</strong> ${c.patientId.name}</p>
                <button class="btn btn-success" onclick="acceptCase('${c._id}')">Accept Case</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading available cases:', error);
    }
}

// Accept case
async function acceptCase(caseId) {
    try {
        const response = await fetch(`${API_URL}/cases/accept/${caseId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Case accepted successfully!');
            loadAvailableCases();
            loadFreelancerCases();
        } else {
            alert(data.message || 'Failed to accept case');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Load freelancer's assigned cases
async function loadFreelancerCases() {
    try {
        const response = await fetch(`${API_URL}/cases/myassignments`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const cases = await response.json();
        const container = document.getElementById('myAssignments');
        
        if (cases.length === 0) {
            container.innerHTML = '<p>No assigned cases.</p>';
            return;
        }
        
        container.innerHTML = cases.map(c => `
            <div class="case-card">
                <h4>${c.insuranceProvider}</h4>
                <p><strong>Policy:</strong> ${c.policyNumber}</p>
                <p><strong>Description:</strong> ${c.description}</p>
                <p><strong>Patient:</strong> ${c.patientId.name}</p>
                <p><strong>Status:</strong> <span class="status status-${c.status}">${c.status}</span></p>
                ${c.status !== 'completed' ? `
                    <select onchange="updateCaseStatus('${c._id}', this.value)">
                        <option value="">Update Status</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

// Update case status
async function updateCaseStatus(caseId, status) {
    if (!status) return;
    
    try {
        const response = await fetch(`${API_URL}/cases/status/${caseId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Status updated!');
            loadFreelancerCases();
        } else {
            alert(data.message || 'Failed to update status');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Admin: Load all cases
async function loadAllCases() {
    try {
        const response = await fetch(`${API_URL}/cases/all`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const cases = await response.json();
        const container = document.getElementById('allCases');
        
        if (cases.length === 0) {
            container.innerHTML = '<p>No cases found.</p>';
            return;
        }
        
        container.innerHTML = cases.map(c => `
            <div class="case-card">
                <h4>${c.insuranceProvider}</h4>
                <p><strong>Policy:</strong> ${c.policyNumber}</p>
                <p><strong>Patient:</strong> ${c.patientId?.name || 'N/A'}</p>
                <p><strong>Status:</strong> <span class="status status-${c.status}">${c.status}</span></p>
                ${c.freelancerId ? 
                    `<p><strong>Assigned to:</strong> ${c.freelancerId.name}</p>` : 
                    `<select class="assign-select" onchange="assignCase('${c._id}', this.value)">
                        <option value="">Assign to Freelancer</option>
                        ${freelancers.map(f => `<option value="${f._id}">${f.name}</option>`).join('')}
                    </select>`
                }
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading all cases:', error);
    }
}

// Admin: Load freelancers for assignment
async function loadFreelancersForAdmin() {
    try {
        const response = await fetch(`${API_URL}/users/freelancers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        freelancers = await response.json();
    } catch (error) {
        console.error('Error loading freelancers:', error);
    }
}

// Admin: Assign case to freelancer
async function assignCase(caseId, freelancerId) {
    if (!freelancerId) return;
    
    try {
        const response = await fetch(`${API_URL}/cases/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ caseId, freelancerId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Case assigned successfully!');
            loadAllCases();
        } else {
            alert(data.message || 'Failed to assign case');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Admin: Load all users
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const users = await response.json();
        const container = document.getElementById('allUsers');
        
        container.innerHTML = users.map(u => `
            <div class="user-card">
                <h4>${u.name}</h4>
                <p><strong>Email:</strong> ${u.email}</p>
                <p><strong>Role:</strong> <span class="status status-${u.role}">${u.role}</span></p>
                <p><small>Joined: ${new Date(u.createdAt).toLocaleDateString()}</small></p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('createCaseModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize dashboard
init();
