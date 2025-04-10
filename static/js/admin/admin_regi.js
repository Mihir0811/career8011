document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('adminRegistrationForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const securityQuestionSelect = document.getElementById('securityQuestion');
    const securityAnswerInput = document.getElementById('securityAnswer');
    const profilePictureInput = document.getElementById('profilePicture');
    const resetBtn = document.getElementById('resetBtn');
    const registerBtn = document.getElementById('registerBtn');
    const alertContainer = document.getElementById('alertContainer');
    const successModal = document.getElementById('successModal');
    const goToDashboardBtn = document.getElementById('goToDashboard');
    const closeModalBtn = document.querySelector('.close-modal');

    // Password toggle buttons
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Password strength elements
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthText = document.querySelector('.strength-text span');
    const passwordRequirements = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special')
    };

    // File upload elements
    const fileUploadBtn = document.querySelector('.file-upload-btn');
    const fileName = document.querySelector('.file-name');
    const profilePreview = document.getElementById('profilePreview');

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Password strength checker
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

    function checkPasswordStrength(password) {
        let strength = 0;
        const meterSections = strengthMeter.querySelectorAll('.meter-section');
        
        // Check length
        if (password.length >= 8) {
            strength++;
            passwordRequirements.length.classList.add('valid');
            passwordRequirements.length.querySelector('i').classList.remove('fa-circle');
            passwordRequirements.length.querySelector('i').classList.add('fa-check-circle');
        } else {
            passwordRequirements.length.classList.remove('valid');
            passwordRequirements.length.querySelector('i').classList.remove('fa-check-circle');
            passwordRequirements.length.querySelector('i').classList.add('fa-circle');
        }
        
        // Check uppercase
        if (/[A-Z]/.test(password)) {
            strength++;
            passwordRequirements.uppercase.classList.add('valid');
            passwordRequirements.uppercase.querySelector('i').classList.remove('fa-circle');
            passwordRequirements.uppercase.querySelector('i').classList.add('fa-check-circle');
        } else {
            passwordRequirements.uppercase.classList.remove('valid');
            passwordRequirements.uppercase.querySelector('i').classList.remove('fa-check-circle');
            passwordRequirements.uppercase.querySelector('i').classList.add('fa-circle');
        }
        
        // Check lowercase
        if (/[a-z]/.test(password)) {
            strength++;
            passwordRequirements.lowercase.classList.add('valid');
            passwordRequirements.lowercase.querySelector('i').classList.remove('fa-circle');
            passwordRequirements.lowercase.querySelector('i').classList.add('fa-check-circle');
        } else {
            passwordRequirements.lowercase.classList.remove('valid');
            passwordRequirements.lowercase.querySelector('i').classList.remove('fa-check-circle');
            passwordRequirements.lowercase.querySelector('i').classList.add('fa-circle');
        }
        
        // Check number
        if (/[0-9]/.test(password)) {
            strength++;
            passwordRequirements.number.classList.add('valid');
            passwordRequirements.number.querySelector('i').classList.remove('fa-circle');
            passwordRequirements.number.querySelector('i').classList.add('fa-check-circle');
        } else {
            passwordRequirements.number.classList.remove('valid');
            passwordRequirements.number.querySelector('i').classList.remove('fa-check-circle');
            passwordRequirements.number.querySelector('i').classList.add('fa-circle');
        }
        
        // Check special character
        if (/[^A-Za-z0-9]/.test(password)) {
            strength++;
            passwordRequirements.special.classList.add('valid');
            passwordRequirements.special.querySelector('i').classList.remove('fa-circle');
            passwordRequirements.special.querySelector('i').classList.add('fa-check-circle');
        } else {
            passwordRequirements.special.classList.remove('valid');
            passwordRequirements.special.querySelector('i').classList.remove('fa-check-circle');
            passwordRequirements.special.querySelector('i').classList.add('fa-circle');
        }
        
        // Update meter
        meterSections.forEach((section, index) => {
            if (index < strength) {
                section.style.backgroundColor = getStrengthColor(strength);
            } else {
                section.style.backgroundColor = '';
            }
        });
        
        // Update text
        strengthText.textContent = getStrengthText(strength);
        strengthText.style.color = getStrengthColor(strength);
    }

    function getStrengthColor(strength) {
        if (strength <= 2) return '#dc3545'; // Weak - Red
        if (strength <= 3) return '#ffc107'; // Medium - Yellow
        return '#28a745'; // Strong - Green
    }

    function getStrengthText(strength) {
        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Medium';
        return 'Strong';
    }

    // File upload handling
    fileUploadBtn.addEventListener('click', function() {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileName.textContent = file.name;
            
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 2 * 1024 * 1024; // 2MB
            
            if (!validTypes.includes(file.type)) {
                document.getElementById('profilePictureError').textContent = 'Invalid file type. Please upload a .jpg, .jpeg, or .png file.';
                this.value = '';
                fileName.textContent = 'No file chosen';
                return;
            }
            
            if (file.size > maxSize) {
                document.getElementById('profilePictureError').textContent = 'File size exceeds 2MB limit.';
                this.value = '';
                fileName.textContent = 'No file chosen';
                return;
            }
            
            document.getElementById('profilePictureError').textContent = '';
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            fileName.textContent = 'No file chosen';
            profilePreview.innerHTML = '<i class="fa-solid fa-user"></i>';
        }
    });

    // Form reset
    resetBtn.addEventListener('click', function() {
        form.reset();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Reset password strength
        const meterSections = strengthMeter.querySelectorAll('.meter-section');
        meterSections.forEach(section => {
            section.style.backgroundColor = '';
        });
        strengthText.textContent = 'Weak';
        strengthText.style.color = '';
        
        // Reset password requirements
        Object.values(passwordRequirements).forEach(req => {
            req.classList.remove('valid');
            req.querySelector('i').classList.remove('fa-check-circle');
            req.querySelector('i').classList.add('fa-circle');
        });
        
        // Reset profile picture
        profilePreview.innerHTML = '<i class="fa-solid fa-user"></i>';
        fileName.textContent = 'No file chosen';
        
        // Reset alert container
        alertContainer.innerHTML = '';
    });

    // Form validation and submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Show loading state
            registerBtn.classList.add('loading');
            
            // Simulate API call
            setTimeout(function() {
                registerBtn.classList.remove('loading');
                
                // Show success modal
                successModal.classList.add('show');
                
                // Reset form
                form.reset();
                profilePreview.innerHTML = '<i class="fa-solid fa-user"></i>';
                fileName.textContent = 'No file chosen';
            }, 2000);
        }
    });

    function validateForm() {
        let isValid = true;
        
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Clear alert container
        alertContainer.innerHTML = '';
        
        // Validate full name
        if (!fullNameInput.value.trim()) {
            document.getElementById('fullNameError').textContent = 'Full name is required';
            isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(fullNameInput.value.trim())) {
            document.getElementById('fullNameError').textContent = 'Full name must contain only letters and spaces';
            isValid = false;
        }
        
        // Validate email
        if (!emailInput.value.trim()) {
            document.getElementById('emailError').textContent = 'Email address is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Validate username
        if (!usernameInput.value.trim()) {
            document.getElementById('usernameError').textContent = 'Username is required';
            isValid = false;
        } else if (usernameInput.value.trim().length < 4) {
            document.getElementById('usernameError').textContent = 'Username must be at least 4 characters long';
            isValid = false;
        }
        
        // Validate password
        if (!passwordInput.value) {
            document.getElementById('passwordError').textContent = 'Password is required';
            isValid = false;
        } else {
            const password = passwordInput.value;
            let passwordErrors = [];
            
            if (password.length < 8) {
                passwordErrors.push('at least 8 characters');
            }
            if (!/[A-Z]/.test(password)) {
                passwordErrors.push('one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                passwordErrors.push('one lowercase letter');
            }
            if (!/[0-9]/.test(password)) {
                passwordErrors.push('one number');
            }
            if (!/[^A-Za-z0-9]/.test(password)) {
                passwordErrors.push('one special character');
            }
            
            if (passwordErrors.length > 0) {
                document.getElementById('passwordError').textContent = `Password must contain ${passwordErrors.join(', ')}`;
                isValid = false;
            }
        }
        
        // Validate confirm password
        if (!confirmPasswordInput.value) {
            document.getElementById('confirmPasswordError').textContent = 'Please confirm your password';
            isValid = false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            isValid = false;
        }
        
        // Validate security question
        if (!securityQuestionSelect.value) {
            document.getElementById('securityQuestionError').textContent = 'Please select a security question';
            isValid = false;
        }
        
        // Validate security answer
        if (!securityAnswerInput.value.trim()) {
            document.getElementById('securityAnswerError').textContent = 'Please provide an answer to the security question';
            isValid = false;
        }
        
        // Validate reCAPTCHA
        if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length === 0) {
            document.getElementById('recaptchaError').textContent = 'Please complete the reCAPTCHA';
            isValid = false;
        }
        
        // If form is invalid, show summary at the top
        if (!isValid) {
            const errorSummary = document.createElement('div');
            errorSummary.className = 'alert alert-danger';
            errorSummary.innerHTML = '<strong>Error:</strong> Please correct the errors below and try again.';
            alertContainer.appendChild(errorSummary);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        return isValid;
    }

    // Modal handling
    goToDashboardBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });

    closeModalBtn.addEventListener('click', function() {
        successModal.classList.remove('show');
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.classList.remove('show');
        }
    });
});