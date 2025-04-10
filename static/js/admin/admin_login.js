document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const alertContainer = document.getElementById('alertContainer');
    const togglePasswordBtn = document.querySelector('.toggle-password');

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });

    // Form validation
    function validateForm() {
        let isValid = true;

        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });

        // Validate username/email
        if (!usernameInput.value.trim()) {
            document.getElementById('usernameError').textContent = 'Username or email is required';
            isValid = false;
        } else if (usernameInput.value.includes('@')) {
            // If input contains @, validate as email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(usernameInput.value.trim())) {
                document.getElementById('usernameError').textContent = 'Please enter a valid email address';
                isValid = false;
            }
        }

        // Validate password
        if (!passwordInput.value) {
            document.getElementById('passwordError').textContent = 'Password is required';
            isValid = false;
        }

        return isValid;
    }

    // Input validation on change
    usernameInput.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('usernameError').textContent = '';
        }
        loginBtn.disabled = !validateFormState();
    });

    passwordInput.addEventListener('input', function() {
        if (this.value) {
            document.getElementById('passwordError').textContent = '';
        }
        loginBtn.disabled = !validateFormState();
    });

    // Check if form is valid to enable/disable button
    function validateFormState() {
        return usernameInput.value.trim() !== '' && passwordInput.value !== '';
    }

    // Set initial button state
    loginBtn.disabled = !validateFormState();

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    
        if (validateForm()) {
            loginBtn.disabled = true; // Disable button to prevent multiple clicks
    
            const payload = {
                username: usernameInput.value.trim(),
                password: passwordInput.value
            };
    
            fetch('/admin_login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                loginBtn.disabled = false; // Re-enable button
                console.log("Response:", data);
    
                if (data.success) {
                    showAlert(data.message, 'success');
                    setTimeout(() => {
                        window.location.href = '/admin_dash';
                    }, 1500);
                } else {
                    showAlert(data.message, 'danger');
                }
            })
            .catch(error => {
                loginBtn.disabled = false; // Re-enable button in case of error
                showAlert('An unexpected error occurred. Please try again.', 'danger');
            });
        }
    });
    
    // Show alert message
    function showAlert(message, type) {
        // Clear previous alerts
        alertContainer.innerHTML = '';

        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // Add alert to container
        alertContainer.appendChild(alert);

        // Auto-dismiss success alerts
        if (type === 'success') {
            setTimeout(function() {
                alert.remove();
            }, 3000);
        }
    }
});
