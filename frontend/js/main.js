const API_URL = 'http://localhost:5000/api';

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
}

checkAuth();
