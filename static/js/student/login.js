document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const alertContainer = document.getElementById('alertContainer');
    const loginBtn = document.getElementById('loginBtn');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const togglePasswordBtn = document.querySelector('.toggle-password');

    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    usernameInput.addEventListener('input', () => clearError(usernameError));
    passwordInput.addEventListener('input', () => clearError(passwordError));

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Functions
    async function handleLogin(e) {
        e.preventDefault();

        // Clear previous errors
        clearAllErrors();

        // Validate inputs
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;

        if (!username) {
            showInputError(usernameError, '*Username is required');
            isValid = false;
        }

        if (!password) {
            showInputError(passwordError, '*Password is required');
            isValid = false;
        }

        if (!isValid) {
            shakeForm();
            return;
        }

        // Simulate login process
        loginBtn.classList.add('loading');

        try {
            const response = await fetch('/student_login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            loginBtn.classList.remove('loading');

            if (response.ok) {
                // Successful login
                showAlert('success', result.message);

                // Save credentials if "Remember Me" is checked
                if (rememberMeCheckbox.checked) {
                    saveCredentials(username);
                } else {
                    clearSavedCredentials();
                }

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/stud_dash'; // Change to your dashboard URL
                }, 1500);
            } else {
                // Failed login
                showAlert('error', result.message);
                shakeForm();
            }
        } catch (error) {
            loginBtn.classList.remove('loading');
            showAlert('error', 'An error occurred while logging in. Please try again later.');
        }
    }

    function showInputError(element, message) {
        element.textContent = message;
    }

    function clearError(element) {
        element.textContent = '';
    }

    function clearAllErrors() {
        usernameError.textContent = '';
        passwordError.textContent = '';
        alertContainer.innerHTML = '';
    }

    function showAlert(type, message) {
        const alertClass = type === 'error' ? 'alert-error' :
            type === 'success' ? 'alert-success' : 'alert-warning';

        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alertClass}`;
        alertElement.textContent = message;

        alertContainer.innerHTML = '';
        alertContainer.appendChild(alertElement);

        // Auto-dismiss success alerts after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                alertElement.remove();
            }, 5000);
        }
    }

    function togglePasswordVisibility() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    function shakeForm() {
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
    }

    function saveCredentials(username) {
        localStorage.setItem('rememberedUser', username);
        localStorage.setItem('rememberMe', 'true');
    }

    function clearSavedCredentials() {
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('rememberMe');
    }

    function checkSavedCredentials() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';

        if (rememberedUser && rememberMe) {
            usernameInput.value = rememberedUser;
            rememberMeCheckbox.checked = true;
        }
    }

    // Initialize saved credentials check
    checkSavedCredentials();
});
