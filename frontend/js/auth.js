const API_URL = 'http://localhost:8765/api';

// Toggle freelancer fields based on role selection
function toggleFreelancerFields() {
    const role = document.getElementById('role').value;
    const freelancerFields = document.getElementById('freelancerFields');
    
    if (role === 'freelancer') {
        freelancerFields.style.display = 'block';
    } else {
        freelancerFields.style.display = 'none';
    }
}

// Handle registration
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };
    
    if (formData.role === 'freelancer') {
        formData.skills = document.getElementById('skills').value;
        formData.experience = document.getElementById('experience').value;
        formData.specialization = document.getElementById('specialization').value;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
