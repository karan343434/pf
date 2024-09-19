document.getElementById('loginButton').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    // Reset error message
    loginErrorMessage.style.display = 'none';

    // Check for valid user credentials
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Successful login
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('uploadContainer').style.display = 'block';
    } else {
        // Login failed
        loginErrorMessage.textContent = "Invalid username or password.";
        loginErrorMessage.style.display = 'block';
    }
});

// Rest of your upload logic goes here...
