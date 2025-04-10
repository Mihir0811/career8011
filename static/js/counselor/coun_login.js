document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Login Section
    const loginSection = document.getElementById('loginSection');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginBtn = document.getElementById('loginBtn');
    const togglePasswordBtn = document.querySelector('.toggle-password');

    // DOM Elements - Verification Section
    const verificationSection = document.getElementById('verificationSection');
    const verificationForm = document.getElementById('verificationForm');
    const codeInputs = document.querySelectorAll('.code-input');
    const emailPreview = document.getElementById('emailPreview');
    const verifyBtn = document.getElementById('verifyBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');

    // DOM Elements - Shared
    const alertContainer = document.getElementById('alertContainer');

    // Variables
    let timerInterval;
    let timeLeft = 120; // 2 minutes in seconds

    // Event Listeners - Login Section
    loginForm.addEventListener('submit', handleLogin);
    emailInput.addEventListener('input', () => clearError(emailError));
    passwordInput.addEventListener('input', () => clearError(passwordError));

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Event Listeners - Verification Section
    verificationForm.addEventListener('submit', handleVerification);
    backToLoginBtn.addEventListener('click', goBackToLogin);

    // Setup code input behavior
    setupCodeInputs();

    // Functions - Login Section
    async function handleLogin(e) {
        e.preventDefault();

        clearAllErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;

        if (!email) {
            showInputError(emailError, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showInputError(emailError, 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showInputError(passwordError, 'Password is required');
            isValid = false;
        }

        if (!isValid) {
            shakeElement(loginForm);
            return;
        }

        loginBtn.classList.add('loading');

        try {
            const response = await fetch('/coun_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('success', 'Email and password verified. Please enter the verification code.');

                loginSection.classList.add('hidden');
                verificationSection.classList.add('active');

                emailPreview.textContent = maskEmail(email);

                startTimer();

                codeInputs[0].focus();
            } else {
                showAlert('error', result.message || 'Invalid email or password. Please try again.');
                shakeElement(loginForm);
            }
        } catch (error) {
            console.error('Error during login:', error);
        } finally {
            loginBtn.classList.remove('loading');
        }
    }

    function togglePasswordVisibility() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // Functions - Verification Section
    async function handleVerification(e) {
        e.preventDefault();

        const code = Array.from(codeInputs).map(input => input.value).join('');

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            codeInputs.forEach(input => input.classList.add('error'));
            showAlert('error', 'Please enter a valid 6-digit code.');
            shakeElement(verificationForm);
            setTimeout(() => {
                codeInputs.forEach(input => input.classList.remove('error'));
            }, 500);
            return;
        }

        verifyBtn.classList.add('loading');

        try {
            const response = await fetch('/verify_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ verification_code: code }),
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('success', 'Verification successful! Redirecting to dashboard...');
                clearInterval(timerInterval);
                setTimeout(() => {
                    window.location.href = '/counselor_dash';
                }, 1500);
            } else {
                showAlert('error', result.message || 'Invalid verification code. Please try again.');
                codeInputs.forEach(input => {
                    input.value = '';
                    input.classList.add('error');
                });
                shakeElement(verificationForm);
                setTimeout(() => {
                    codeInputs.forEach(input => input.classList.remove('error'));
                    codeInputs[0].focus();
                }, 500);
            }
        } catch (error) {
            console.error('Error during verification:', error);
            showAlert('error', 'An error occurred while verifying your code. Please try again later.');
        } finally {
            verifyBtn.classList.remove('loading');
        }
    }

    function goBackToLogin() {
        codeInputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        clearInterval(timerInterval);
        verificationSection.classList.remove('active');
        loginSection.classList.remove('hidden');
        alertContainer.innerHTML = '';
    }

    function setupCodeInputs() {
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1) {
                    if (index < codeInputs.length - 1) {
                        codeInputs[index + 1].focus();
                    }
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });

            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        });
    }

    function showInputError(element, message) {
        element.textContent = message;
    }

    function clearError(element) {
        element.textContent = '';
    }

    function clearAllErrors() {
        emailError.textContent = '';
        passwordError.textContent = '';
        alertContainer.innerHTML = '';
    }

    function showAlert(type, message) {
        const alertClass = type === 'error' ? 'alert-error' : 
                          type === 'success' ? 'alert-success' : 'alert-warning';
        const icon = type === 'error' ? 'fa-circle-exclamation' : 
                    type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';

        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alertClass}`;
        alertElement.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

        alertContainer.innerHTML = '';
        alertContainer.appendChild(alertElement);

        if (type === 'success') {
            setTimeout(() => {
                if (alertContainer.contains(alertElement)) {
                    alertElement.remove();
                }
            }, 5000);
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function maskEmail(email) {
        const [username, domain] = email.split('@');
        const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${maskedUsername}@${domain}`;
    }

    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
});
