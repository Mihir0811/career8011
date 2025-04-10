document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const form = document.getElementById("counselorRegistrationForm")
    const steps = document.querySelectorAll(".form-step")
    const stepIndicators = document.querySelectorAll(".step")
    const nextStep1Btn = document.getElementById("nextStep1")
    const nextStep2Btn = document.getElementById("nextStep2")
    const prevStep2Btn = document.getElementById("prevStep2")
    const prevStep3Btn = document.getElementById("prevStep3")
    const resetBtn = document.getElementById("resetBtn")
    const overlay = document.getElementById("overlay")
    const customInterestModal = document.getElementById("customInterestModal")
    const addCustomInterestBtn = document.getElementById("addCustomInterest")
    const saveCustomInterestBtn = document.getElementById("saveCustomInterest")
    const cancelCustomInterestBtn = document.getElementById("cancelCustomInterest")
    const closeModalBtns = document.querySelectorAll(".close-modal")
    const successModal = document.getElementById("successModal")
    const successDoneBtn = document.getElementById("successDoneBtn")
  
    // Form fields
    const fullNameInput = document.getElementById("fullName")
    const emailInput = document.getElementById("email")
    const passwordInput = document.getElementById("password")
    const confirmPasswordInput = document.getElementById("confirmPassword")
    const contactNumberInput = document.getElementById("contactNumber")
    const specializationSelect = document.getElementById("specialization")
    const bioTextarea = document.getElementById("bio")
    const bioCharCount = document.getElementById("bioCharCount")
    const profilePictureInput = document.getElementById("profilePicture")
    const profilePreview = document.getElementById("profilePreview")
    const fileName = document.getElementById("fileName")
    const togglePasswordBtns = document.querySelectorAll(".toggle-password")
    const strengthBar = document.getElementById("strengthBar")
    const strengthText = document.getElementById("strengthText")
  
    // Step 2 elements
    const interestSearch = document.getElementById("interestSearch")
    const interestsContainer = document.getElementById("interestsContainer")
    const selectedInterests = document.getElementById("selectedInterests")
    const customInterestName = document.getElementById("customInterestName")
    const customInterestDescription = document.getElementById("customInterestDescription")
  
    // Step 3 elements
    const dayCheckboxes = document.querySelectorAll('input[name="days"]')
    const startTimeInput = document.getElementById("startTime")
    const endTimeInput = document.getElementById("endTime")
    const breakStartInput = document.getElementById("breakStart")
    const breakEndInput = document.getElementById("breakEnd")
  
    // Review elements
    const reviewName = document.getElementById("reviewName")
    const reviewEmail = document.getElementById("reviewEmail")
    const reviewContact = document.getElementById("reviewContact")
    const reviewSpecialization = document.getElementById("reviewSpecialization")
    const reviewBio = document.getElementById("reviewBio")
    const reviewInterests = document.getElementById("reviewInterests")
    const reviewDays = document.getElementById("reviewDays")
    const reviewHours = document.getElementById("reviewHours")
    const reviewBreak = document.getElementById("reviewBreak")
  
    // Error message elements
    const fullNameError = document.getElementById("fullNameError")
    const emailError = document.getElementById("emailError")
    const passwordError = document.getElementById("passwordError")
    const confirmPasswordError = document.getElementById("confirmPasswordError")
    const contactNumberError = document.getElementById("contactNumberError")
    const specializationError = document.getElementById("specializationError")
    const bioError = document.getElementById("bioError")
    const profilePictureError = document.getElementById("profilePictureError")
    const interestsError = document.getElementById("interestsError")
    const availabilityError = document.getElementById("availabilityError")
    const customInterestError = document.getElementById("customInterestError")
  
  
    // Selected interests array
     window.selectedInterestsArray = [];
    let nextInterestId = careerInterests.length + 1
  
    // Initialize the form
    function init() {
      loadCareerInterests()
      setupEventListeners()
    }
  
    // Load career interests
    function loadCareerInterests() {
      interestsContainer.innerHTML = ""
  
      careerInterests.forEach((interest) => {
        const interestItem = document.createElement("div")
        interestItem.className = "interest-item"
        interestItem.innerHTML = `
                  <input type="checkbox" id="interest-${interest.id}" value="${interest.id}" data-name="${interest.interest_name}">
                  <label for="interest-${interest.id}">${interest.interest_name}</label>
              `
        interestsContainer.appendChild(interestItem)
      })
  
      // Add event listeners to checkboxes
      const interestCheckboxes = interestsContainer.querySelectorAll('input[type="checkbox"]')
      interestCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleInterestSelection)
      })
    }
  
    // Set up event listeners
    function setupEventListeners() {
      // Step navigation
      nextStep1Btn.addEventListener("click", validateStep1)
      nextStep2Btn.addEventListener("click", validateStep2)
      prevStep2Btn.addEventListener("click", () => goToStep(0))
      prevStep3Btn.addEventListener("click", () => goToStep(1))
  
      // Form submission
      form.addEventListener("submit", handleSubmit)
  
      // Reset button
      resetBtn.addEventListener("click", resetForm)
  
      // Bio character count
      bioTextarea.addEventListener("input", updateCharCount)
  
      // Profile picture preview
      profilePictureInput.addEventListener("change", handleProfilePicture)
  
      // Toggle password visibility
      togglePasswordBtns.forEach((btn) => {
        btn.addEventListener("click", togglePasswordVisibility)
      })
  
      // Password strength meter
      passwordInput.addEventListener("input", checkPasswordStrength)
  
      // Real-time password confirmation
      confirmPasswordInput.addEventListener("input", validatePasswordMatch)
  
      // Interest search
      interestSearch.addEventListener("input", filterInterests)
  
      // Custom interest modal
      addCustomInterestBtn.addEventListener("click", openCustomInterestModal)
      saveCustomInterestBtn.addEventListener("click", saveCustomInterest)
      cancelCustomInterestBtn.addEventListener("click", closeCustomInterestModal)
  
      // Close modals
      closeModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          customInterestModal.style.display = "none"
          overlay.style.display = "none"
        })
      })
  
      // Success modal done button
      successDoneBtn.addEventListener("click", () => {
        successModal.style.display = "none"
        overlay.style.display = "none"
      })
  
      // Email validation on blur
      emailInput.addEventListener("blur", validateEmailUniqueness)
  
      // Phone number validation
      contactNumberInput.addEventListener("input", formatPhoneNumber)
    }
  
    // Go to a specific step
    function goToStep(stepIndex) {
      steps.forEach((step, index) => {
        step.classList.remove("active")
        if (index === stepIndex) {
          step.classList.add("active")
        }
      })
  
      stepIndicators.forEach((indicator, index) => {
        indicator.classList.remove("active", "completed")
        if (index === stepIndex) {
          indicator.classList.add("active")
        } else if (index < stepIndex) {
          indicator.classList.add("completed")
        }
      })
  
      // Update review information if going to step 3
      if (stepIndex === 2) {
        updateReviewInformation()
      }
  
      // Scroll to top
      window.scrollTo(0, 0)
    }
  
    // Validate Step 1
    function validateStep1() {
      let isValid = true
  
      // Reset error messages
      fullNameError.textContent = ""
      emailError.textContent = ""
      passwordError.textContent = ""
      confirmPasswordError.textContent = ""
      contactNumberError.textContent = ""
      specializationError.textContent = ""
      bioError.textContent = ""
  
      // Validate full name
      if (!fullNameInput.value.trim()) {
        fullNameError.textContent = "Full name is required"
        isValid = false
      } else if (fullNameInput.value.trim().length < 3) {
        fullNameError.textContent = "Full name must be at least 3 characters"
        isValid = false
      }
  
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailInput.value.trim()) {
        emailError.textContent = "Email is required"
        isValid = false
      } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = "Please enter a valid email address"
        isValid = false
      }
  
      // Validate password
      if (!passwordInput.value) {
        passwordError.textContent = "Password is required"
        isValid = false
      } else if (passwordInput.value.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters"
        isValid = false
      }
  
      // Validate confirm password
      if (!confirmPasswordInput.value) {
        confirmPasswordError.textContent = "Please confirm your password"
        isValid = false
      } else if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = "Passwords do not match"
        isValid = false
      }
  
      // Validate contact number
    //   const phoneRegex = /^$$\d{3}$$ \d{3}-\d{4}$/
    //   if (!contactNumberInput.value.trim()) {
    //     contactNumberError.textContent = "Contact number is required"
    //     isValid = false
    //   } else if (!phoneRegex.test(contactNumberInput.value.trim())) {
    //     contactNumberError.textContent = "Please enter a valid phone number"
    //     isValid = false
    //   }
  
      // Validate specialization
      if (!specializationSelect.value) {
        specializationError.textContent = "Please select a specialization"
        isValid = false
      }
  
      // Validate bio
      if (!bioTextarea.value.trim()) {
        bioError.textContent = "Bio is required"
        isValid = false
      } else if (bioTextarea.value.trim().length < 50) {
        bioError.textContent = "Bio must be at least 50 characters"
        isValid = false
      } else if (bioTextarea.value.trim().length > 500) {
        bioError.textContent = "Bio cannot exceed 500 characters"
        isValid = false
      }
  
      if (isValid) {
        goToStep(1)
      }
    }
  
    // Validate Step 2
    function validateStep2() {
      let isValid = true
  
      // Reset error messages
      interestsError.textContent = ""
  
      // Validate interests
      if (selectedInterestsArray.length === 0) {
        interestsError.textContent = "Please select at least one career interest"
        isValid = false
      }
  
      if (isValid) {
        goToStep(2)
      }
    }
  
    // Handle form submission
    function handleSubmit(e) {
      e.preventDefault()
  
      let isValid = true
  
      // Reset error messages
      availabilityError.textContent = ""
  
      // Validate availability
      const selectedDays = Array.from(dayCheckboxes).filter((checkbox) => checkbox.checked)
      if (selectedDays.length === 0) {
        availabilityError.textContent = "Please select at least one day of availability"
        isValid = false
      }
  
      // Validate time slots
      // const startTime = startTimeInput.value
      // const endTime = endTimeInput.value
      // const breakStart = breakStartInput.value
      // const breakEnd = breakEndInput.value
  
      // if (startTime >= endTime) {
      //   availabilityError.textContent = "End time must be after start time"
      //   isValid = false
      // }
  
      // if (breakStart >= breakEnd) {
      //   availabilityError.textContent = "Break end time must be after break start time"
      //   isValid = false
      // }
  
      // if (breakStart < startTime || breakEnd > endTime) {
      //   availabilityError.textContent = "Break time must be within working hours"
      //   isValid = false
      // }
  
      if (isValid) {
        // Show success modal
        successModal.style.display = "block"
        overlay.style.display = "block"
  
        // In a real application, you would submit the form data to the server here
        // console.log("Form submitted successfully!")
        // console.log({
        //   fullName: fullNameInput.value,
        //   email: emailInput.value,
        //   contactNumber: contactNumberInput.value,
        //   specialization: specializationSelect.value,
        //   bio: bioTextarea.value,
        //   interests: selectedInterestsArray,
        //   availability: {
        //     days: Array.from(selectedDays).map((day) => day.value),
        //     workingHours: {
        //       start: startTime,
        //       end: endTime,
        //     },
        //     breakTime: {
        //       start: breakStart,
        //       end: breakEnd,
        //     },
        //   },
        // })
      }
    }
  
    // Reset form
    function resetForm() {
      form.reset()
      profilePreview.innerHTML = '<i class="fas fa-user"></i>'
      fileName.textContent = "No file chosen"
      strengthBar.style.width = "0"
      strengthText.textContent = "Password strength"
      bioCharCount.textContent = "0"
  
      // Reset selected interests
      selectedInterestsArray = []
      updateSelectedInterestsDisplay()
  
      // Reset checkboxes in interests container
      const interestCheckboxes = interestsContainer.querySelectorAll('input[type="checkbox"]')
      interestCheckboxes.forEach((checkbox) => {
        checkbox.checked = false
      })
  
      // Clear error messages
      const errorMessages = document.querySelectorAll(".error-message")
      errorMessages.forEach((error) => {
        error.textContent = ""
      })
    }
  
    // Update character count for bio
    function updateCharCount() {
      const count = bioTextarea.value.length
      bioCharCount.textContent = count
  
      if (count > 500) {
        bioCharCount.style.color = "var(--danger-color)"
      } else {
        bioCharCount.style.color = "var(--text-muted)"
      }
    }
  
    // Handle profile picture upload
    function handleProfilePicture() {
      const file = profilePictureInput.files[0]
  
      if (file) {
        fileName.textContent = file.name
  
        if (!file.type.match("image.*")) {
          profilePictureError.textContent = "Please select an image file"
          profilePreview.innerHTML = '<i class="fas fa-user"></i>'
          return
        }
  
        profilePictureError.textContent = ""
  
        const reader = new FileReader()
        reader.onload = (e) => {
          profilePreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`
        }
        reader.readAsDataURL(file)
      } else {
        fileName.textContent = "No file chosen"
        profilePreview.innerHTML = '<i class="fas fa-user"></i>'
      }
    }
  
    // Toggle password visibility
    function togglePasswordVisibility() {
      const input = this.parentElement.querySelector("input")
      const icon = this.querySelector("i")
  
      if (input.type === "password") {
        input.type = "text"
        icon.className = "fas fa-eye-slash"
      } else {
        input.type = "password"
        icon.className = "fas fa-eye"
      }
    }
  
    // Check password strength
    function checkPasswordStrength() {
      const password = passwordInput.value
      let strength = 0
  
      if (password.length >= 8) strength += 1
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1
      if (password.match(/\d/)) strength += 1
      if (password.match(/[^a-zA-Z\d]/)) strength += 1
  
      switch (strength) {
        case 0:
          strengthBar.style.width = "0"
          strengthBar.style.backgroundColor = "var(--danger-color)"
          strengthText.textContent = "Password strength"
          break
        case 1:
          strengthBar.style.width = "25%"
          strengthBar.style.backgroundColor = "var(--danger-color)"
          strengthText.textContent = "Weak"
          break
        case 2:
          strengthBar.style.width = "50%"
          strengthBar.style.backgroundColor = "var(--warning-color)"
          strengthText.textContent = "Fair"
          break
        case 3:
          strengthBar.style.width = "75%"
          strengthBar.style.backgroundColor = "var(--primary-color)"
          strengthText.textContent = "Good"
          break
        case 4:
          strengthBar.style.width = "100%"
          strengthBar.style.backgroundColor = "var(--success-color)"
          strengthText.textContent = "Strong"
          break
      }
  
      // Validate password match if confirm password has a value
      if (confirmPasswordInput.value) {
        validatePasswordMatch()
      }
    }
  
    // Validate password match
    function validatePasswordMatch() {
      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = "Passwords do not match"
      } else {
        confirmPasswordError.textContent = ""
      }
    }
  
    // Validate email uniqueness (simulated)
    function validateEmailUniqueness() {
      const email = emailInput.value.trim()
  
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        // Simulate AJAX request
        setTimeout(() => {
          // For demo purposes, we'll consider 'test@example.com' as already taken
          if (email === "test@example.com") {
            emailError.textContent = "This email is already registered"
          } else {
            emailError.textContent = ""
          }
        }, 500)
      }
    }
  
    // Format phone number
    function formatPhoneNumber() {
      let input = contactNumberInput.value.replace(/\D/g, "")
  
      if (input.length > 10) {
        input = input.substring(0, 10)
      }
  
      if (input.length >= 6) {
        contactNumberInput.value = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6)}`
      } else if (input.length >= 3) {
        contactNumberInput.value = `(${input.substring(0, 3)}) ${input.substring(3)}`
      } else if (input.length > 0) {
        contactNumberInput.value = `(${input}`
      }
    }
  
    // Filter interests based on search
    function filterInterests() {
      const searchTerm = interestSearch.value.toLowerCase()
      const interestItems = interestsContainer.querySelectorAll(".interest-item")
  
      interestItems.forEach((item) => {
        const interestName = item.querySelector("label").textContent.toLowerCase()
        if (interestName.includes(searchTerm)) {
          item.style.display = "flex"
        } else {
          item.style.display = "none"
        }
      })
    }
  
    // Handle interest selection
    function handleInterestSelection() {
      const interestId = Number.parseInt(this.value)
      const interestName = this.getAttribute("data-name")
  
      if (this.checked) {
        // Add to selected interests
        selectedInterestsArray.push({ id: interestId, interest_name: interestName })
      } else {
        // Remove from selected interests
        selectedInterestsArray = selectedInterestsArray.filter((interest) => interest.id !== interestId)
      }
  
      updateSelectedInterestsDisplay()
    }
  
    // Update selected interests display
    function updateSelectedInterestsDisplay() {
      if (selectedInterestsArray.length === 0) {
        selectedInterests.innerHTML = '<div class="empty-selection">No interests selected yet</div>'
        return
      }
  
      selectedInterests.innerHTML = ""
  
      selectedInterestsArray.forEach((interest) => {
        const interestTag = document.createElement("div")
        interestTag.className = "interest-tag"
        interestTag.innerHTML = `
                  ${interest.interest_name}
                  <button type="button" data-id="${interest.id}">
                      <i class="fas fa-times"></i>
                  </button>
              `
        selectedInterests.appendChild(interestTag)
      })
  
      // Add event listeners to remove buttons
      const removeButtons = selectedInterests.querySelectorAll("button")
      removeButtons.forEach((button) => {
        button.addEventListener("click", removeInterest)
      })
    }
  
    // Remove interest
    function removeInterest() {
      const interestId = Number.parseInt(this.getAttribute("data-id"))
  
      // Update selected interests array
      selectedInterestsArray = selectedInterestsArray.filter((interest) => interest.id !== interestId)
  
      // Update checkbox state
      const checkbox = document.getElementById(`interest-${interestId}`)
      if (checkbox) {
        checkbox.checked = false
      }
  
      // Update display
      updateSelectedInterestsDisplay()
    }
  
    // Open custom interest modal
    function openCustomInterestModal() {
      customInterestModal.style.display = "block"
      overlay.style.display = "block"
      customInterestName.value = ""
      customInterestDescription.value = ""
      customInterestError.textContent = ""
    }
  
    // Close custom interest modal
    function closeCustomInterestModal() {
      customInterestModal.style.display = "none"
      overlay.style.display = "none"
    }
  
    // Save custom interest
    function saveCustomInterest() {
      const interestName = customInterestName.value.trim()
  
      if (!interestName) {
        customInterestError.textContent = "Please enter an interest name"
        return
      }
  
      // Check if interest already exists
      const existingInterest = careerInterests.find(
        (interest) => interest.interest_name.toLowerCase() === interestName.toLowerCase(),
      )
  
      if (existingInterest) {
        customInterestError.textContent = "This interest already exists"
        return
      }
  
      // Add new interest
      const newInterest = {
        id: nextInterestId++,
        interest_name: interestName,
      }
  
      careerInterests.push(newInterest)
  
      // Add to selected interests
      selectedInterestsArray.push(newInterest)
  
      // Update displays
      loadCareerInterests()
      updateSelectedInterestsDisplay()
  
      // Check the new interest checkbox
      setTimeout(() => {
        const checkbox = document.getElementById(`interest-${newInterest.id}`)
        if (checkbox) {
          checkbox.checked = true
        }
      }, 0)
  
      // Close modal
      closeCustomInterestModal()
    }
  
    // Update review information
    function updateReviewInformation() {
      // Personal information
      reviewName.textContent = fullNameInput.value || "Not provided"
      reviewEmail.textContent = emailInput.value || "Not provided"
      reviewContact.textContent = contactNumberInput.value || "Not provided"
  
      // Specialization
      const specializationOption = specializationSelect.options[specializationSelect.selectedIndex]
      reviewSpecialization.textContent = specializationOption ? specializationOption.text : "Not selected"
  
      // Bio
      reviewBio.textContent = bioTextarea.value || "Not provided"
  
      // Interests
      console.log("Selected Interests Array:", selectedInterestsArray);
      if (selectedInterestsArray.length === 0) {
        reviewInterests.textContent = "None selected"
      } else {
        reviewInterests.innerHTML = selectedInterestsArray
          .map((interest) => `<span class="review-tag">${interest.interest_name}</span>`)
          .join(", ")
      }
  
      // Available days
      const selectedDays = Array.from(dayCheckboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value)
  
      if (selectedDays.length === 0) {
        reviewDays.textContent = "None selected"
      } else {
        reviewDays.textContent = selectedDays.join(", ")
      }
  
      // Working hours
      reviewHours.textContent = `${formatTime(startTimeInput.value)} to ${formatTime(endTimeInput.value)}`
  
      // Break time
      reviewBreak.textContent = `${formatTime(breakStartInput.value)} to ${formatTime(breakEndInput.value)}`
    }
  
    // Format time for display
    function formatTime(timeString) {
      const [hours, minutes] = timeString.split(":")
      const hour = Number.parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const formattedHour = hour % 12 || 12
      return `${formattedHour}:${minutes} ${ampm}`
    }


// Get all checkboxes and addSlot buttons
const checkboxes = document.querySelectorAll(".day-checkbox input[type='checkbox']");
const addSlotButtons = document.querySelectorAll(".add-slot-btn");

// Function to enable/disable Add Slot button based on checkbox state
checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        const day = this.id; // Get the ID of the checkbox (e.g., 'monday', 'tuesday')
        const button = document.querySelector(`.add-slot-btn[data-day="${day}"]`);

        if (this.checked) {
            // Enable the button if the checkbox is checked
            button.disabled = false;
        } else {
            // Disable the button if the checkbox is unchecked
            button.disabled = true;
        }
    });
});

// Add Slot button functionality
addSlotButtons.forEach(button => {
    button.disabled = true; // Initially disable all buttons

    button.addEventListener("click", function () {
        const day = this.dataset.day;
        const slotsContainer = document.getElementById(`${day}Slots`);

        // Create a new time slot group
        const slotGroup = document.createElement("div");
        slotGroup.classList.add("time-slot-group");
        slotGroup.innerHTML = `
            <div class="time-inputs">
                <label>From</label>
                <input type="time" name="${day}StartTime[]" required>
            </div>
            <div class="time-inputs">
                <label>To</label>
                <input type="time" name="${day}EndTime[]" required>
            </div><br>
            <button type="button" class="remove-slot-btn">Remove</button>
        `;

        // Append the new time slot group to the container
        slotsContainer.appendChild(slotGroup);

        // Add event listener for "Remove Slot" button
        slotGroup.querySelector(".remove-slot-btn").addEventListener("click", function () {
            slotGroup.remove();
        });
    });

});

  
    // Initialize the form
    init()
  })
  
  