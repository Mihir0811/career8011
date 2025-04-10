document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('registrationForm');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const nextToStep2Btn = document.getElementById('nextToStep2');
    const backToStep1Btn = document.getElementById('backToStep1');
    const steps = document.querySelectorAll('.step');
    
    // Form Fields
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const contactNumberInput = document.getElementById('contactNumber');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
    const captchaInput = document.getElementById('captchaInput');
    
    // Error Messages
    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const contactNumberError = document.getElementById('contactNumberError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const interestsError = document.getElementById('interestsError');
    const captchaError = document.getElementById('captchaError');
    
    // Password Strength Elements
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // Captcha Elements
    const captchaText = document.getElementById('captchaText');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    
    // Toggle Password Visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
    
    // Generate Captcha
    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        captchaText.textContent = captcha;
        return captcha;
    }
    
    let currentCaptcha = generateCaptcha();
    
    refreshCaptchaBtn.addEventListener('click', () => {
        currentCaptcha = generateCaptcha();
    });
    
    // Password Strength Checker
    passwordInput.addEventListener('input', checkPasswordStrength);
    
    function checkPasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]+/)) strength += 25;
        if (password.match(/[A-Z]+/)) strength += 25;
        if (password.match(/[0-9]+/) || password.match(/[^a-zA-Z0-9]+/)) strength += 25;
        
        strengthBar.style.width = `${strength}%`;
        
        if (strength <= 25) {
            strengthBar.style.backgroundColor = "#ef4444"; // danger-color
            strengthText.textContent = 'Weak password';
        } else if (strength <= 50) {
            strengthBar.style.backgroundColor = "#f59e0b"; // warning-color
            strengthText.textContent = 'Fair password';
        } else if (strength <= 75) {
            strengthBar.style.backgroundColor = "#3b82f6"; // info-color
            strengthText.textContent = 'Good password';
        } else {
            strengthBar.style.backgroundColor = "#10b981"; // success-color
            strengthText.textContent = 'Strong password';
        }
    }
    
    // Form Navigation
    nextToStep2Btn.addEventListener('click', () => {
        if (validateStep1()) {
            step1.classList.remove('active');
            step2.classList.add('active');
            steps[0].classList.remove('active');
            steps[1].classList.add('active');
            window.scrollTo(0, 0);
        }
    });
    
    backToStep1Btn.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
        steps[1].classList.remove('active');
        steps[0].classList.add('active');
        window.scrollTo(0, 0);
    });
    
    // Form Validation
    function validateStep1() {
        let isValid = true;
        
        // Validate Full Name
        if (fullNameInput.value.trim() === '') {
            fullNameError.textContent = 'Please enter your full name';
            isValid = false;
        } else if (fullNameInput.value.trim().length < 3) {
            fullNameError.textContent = 'Name must be at least 3 characters';
            isValid = false;
        } else {
            fullNameError.textContent = '';
        }
        
        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Please enter your email address';
            isValid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        } else {
            emailError.textContent = '';
        }
        
        // Validate Contact Number
        const phoneRegex = /^\d{10}$/;
        if (contactNumberInput.value.trim() === '') {
            contactNumberError.textContent = 'Please enter your contact number';
            isValid = false;
        } else if (!phoneRegex.test(contactNumberInput.value.trim())) {
            contactNumberError.textContent = 'Please enter a valid 10-digit number';
            isValid = false;
        } else {
            contactNumberError.textContent = '';
        }
        
        // Validate Password
        if (passwordInput.value === '') {
            passwordError.textContent = 'Please enter a password';
            isValid = false;
        } else if (passwordInput.value.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }
        
        // Validate Confirm Password
        if (confirmPasswordInput.value === '') {
            confirmPasswordError.textContent = 'Please confirm your password';
            isValid = false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            confirmPasswordError.textContent = 'Passwords do not match';
            isValid = false;
        } else {
            confirmPasswordError.textContent = '';
        }
        
        return isValid;
    }
    
    function validateStep2() {
        let isValid = true;
        
        // Validate Interests (at least 3)
        const selectedInterests = Array.from(interestCheckboxes).filter(checkbox => checkbox.checked);
        if (selectedInterests.length < 2) {
            interestsError.textContent = 'Please select at least 2 interests';
            isValid = false;
        } else {
            interestsError.textContent = '';
        }
        
        // Validate Captcha
        if (captchaInput.value.trim() === '') {
            captchaError.textContent = 'Please enter the captcha code';
            isValid = false;
        } else if (captchaInput.value.trim() !== currentCaptcha) {
            captchaError.textContent = 'Incorrect captcha code';
            isValid = false;
        } else {
            captchaError.textContent = '';
        }
        
        return isValid;
    }
    
    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateStep2()) {
            // Simulate form submission
            const submitBtn = document.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            
            // Collect form data
            const formData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                contactNumber: contactNumberInput.value.trim(),
                password: passwordInput.value,
                interests: Array.from(interestCheckboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value)
            };
            
            // Simulate API call with timeout
            setTimeout(() => {
                console.log('Registration data:', formData);
                
                // Show success step
                step2.classList.remove('active');
                step3.classList.add('active');
                steps[1].classList.remove('active');
                steps[2].classList.add('active');
                window.scrollTo(0, 0);
                
                // Reset form for future use
                form.reset();
            }, 1500);
        }
    });
    
    // Initialize the form
    function init() {
        // Set the first step as active
        step1.classList.add('active');
        steps[0].classList.add('active');
        
        // Generate initial captcha
        generateCaptcha();
        
        // Add input event listeners for real-time validation
        fullNameInput.addEventListener('input', () => {
            if (fullNameInput.value.trim() !== '' && fullNameInput.value.trim().length >= 3) {
                fullNameError.textContent = '';
            }
        });
        
        emailInput.addEventListener('input', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInput.value.trim())) {
                emailError.textContent = '';
            }
        });
        
        contactNumberInput.addEventListener('input', () => {
            const phoneRegex = /^\d{10}$/;
            if (phoneRegex.test(contactNumberInput.value.trim())) {
                contactNumberError.textContent = '';
            }
        });
        
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value === passwordInput.value) {
                confirmPasswordError.textContent = '';
            }
        });
        
        // Add change listeners for interests
        interestCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedInterests = Array.from(interestCheckboxes).filter(cb => cb.checked);
                if (selectedInterests.length >= 3) {
                    interestsError.textContent = '';
                }
            });
        });
        
        // Add input listener for captcha
        captchaInput.addEventListener('input', () => {
            if (captchaInput.value.trim() === currentCaptcha) {
                captchaError.textContent = '';
            }
        });
    }
    
    // Initialize the form
    init();
});