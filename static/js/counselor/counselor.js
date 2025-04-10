document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")
  // const mainContent = document.querySelector(".main-content")
  const notificationBtn = document.getElementById("notificationBtn")
  const notificationDropdown = document.getElementById("notificationDropdown")
  const profileBtn = document.getElementById("profileBtn")
  const profileMenu = document.getElementById("profileMenu")
  const navItems = document.querySelectorAll(".sidebar-nav li")
  const contentSections = document.querySelectorAll(".content-section")
  const quickActionBtns = document.querySelectorAll(".action-btn[data-target]")
  const viewBtns = document.querySelectorAll(".view-btn")
  const viewContainers = document.querySelectorAll(".view-container")
  const rescheduleButtons = document.querySelectorAll(".action-icon.reschedule")
  const rejectButtons = document.querySelectorAll(".action-icon.reject")
  const rescheduleModal = document.getElementById("rescheduleModal")
  const rejectModal = document.getElementById("rejectModal")
  const closeModalButtons = document.querySelectorAll(".close-modal, .cancel-btn")

  // Toggle Sidebar
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })

  

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 992 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove("active")
    }
  })

  // Toggle Notification Dropdown
  notificationBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    notificationDropdown.classList.toggle("active")
    profileMenu.classList.remove("active")
  })

  // Toggle Profile Menu
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    profileMenu.classList.toggle("active")
    notificationDropdown.classList.remove("active")
  })

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!notificationBtn.contains(e.target)) {
      notificationDropdown.classList.remove("active")
    }
    if (!profileBtn.contains(e.target)) {
      profileMenu.classList.remove("active")
    }
  })

  // Mark all notifications as read
  const markAllReadBtn = document.querySelector(".mark-all-read")
  markAllReadBtn.addEventListener("click", () => {
    const unreadNotifications = document.querySelectorAll(".notification-item.unread")
    unreadNotifications.forEach((notification) => {
      notification.classList.remove("unread")
    })
    document.querySelector(".notification-badge").style.display = "none"
  })

  // Navigation handling
  // navItems.forEach((item) => {
  //   item.addEventListener("click", function (e) {  
  //     e.preventDefault();
  //     // Remove 'active' class from all nav items
  //     navItems.forEach((navItem) => navItem.classList.remove("active"));
  //     this.classList.add("active"); // Add 'active' class to clicked item
  
  //     // Show corresponding section
  //     const targetSection = this.getAttribute("data-section");
  //     contentSections.forEach((section) => {
  //       if (section.id === `${targetSection}-section`) {
  //         section.classList.add("active");
  //       } 
  //     });
  
  //     // Close sidebar on mobile view
  //     if (window.innerWidth <= 992) {
  //       sidebar.classList.remove("active");
  //     }
  //   });
  // });
  

  

  // View toggle (table/calendar)
  viewBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      viewBtns.forEach((viewBtn) => viewBtn.classList.remove("active"))
      this.classList.add("active")

      const targetView = this.getAttribute("data-view")
      viewContainers.forEach((container) => {
        container.style.display = "none"
        if (container.id === `${targetView}-view`) {
          container.style.display = "block"
        }
      })
    })
  })

  // Modal handling
  rescheduleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      rescheduleModal.classList.add("active")
    })
  })

  rejectButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      rejectModal.classList.add("active")
    })
  })

  closeModalButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.remove("active")
      })
    })
  })

  // Close modal when clicking outside
  document.addEventListener("click", (e) => {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  })

  // Initialize Charts
  // Appointments Chart
  const appointmentsCtx = document.getElementById("appointmentsChart");
  new Chart(appointmentsCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Appointments",
          data: [65, 59, 80, 81, 56, 55],
          borderColor: "#00796b",
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Monthly Appointments",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })

  // Feedback Chart
  const feedbackCtx = document.getElementById("feedbackChart")
  new Chart(feedbackCtx, {
    type: "doughnut",
    data: {
      labels: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"],
      datasets: [
        {
          data: [32, 9, 3, 1, 0],
          backgroundColor: ["#388e3c", "#00796b", "#ffa000", "#f57c00", "#d32f2f"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Feedback Distribution",
        },
      },
    },
  })

  // Rating Chart
  const ratingCtx = document.getElementById("ratingChart")
  new Chart(ratingCtx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Average Rating",
          data: [4.5, 4.6, 4.7, 4.8, 4.7, 4.9],
          backgroundColor: "#00796b",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Monthly Rating Trend",
        },
      },
      scales: {
        y: {
          min: 3,
          max: 5,
          ticks: {
            stepSize: 0.5,
          },
        },
      },
    },
  })

  // Calendar functionality
  function generateCalendar() {
    const calendarDates = document.getElementById("calendar-dates")
    const calendarTitle = document.getElementById("calendar-title")
    const prevMonthBtn = document.getElementById("prev-month")
    const nextMonthBtn = document.getElementById("next-month")

    // Current date
    const currentDate = new Date()
    let currentMonth = currentDate.getMonth()
    let currentYear = currentDate.getFullYear()

    // Sample appointment data
    const appointments = [
      { date: new Date(2025, 2, 7), status: "completed" },
      { date: new Date(2025, 2, 8), status: "pending" },
      { date: new Date(2025, 2, 8), status: "approved" },
      { date: new Date(2025, 2, 9), status: "pending" },
      { date: new Date(2025, 2, 10), status: "approved" },
      { date: new Date(2025, 2, 15), status: "pending" },
      { date: new Date(2025, 2, 18), status: "approved" },
      { date: new Date(2025, 2, 22), status: "completed" },
    ]

    function renderCalendar() {
      // Clear previous calendar
      calendarDates.innerHTML = ""

      // Set calendar title
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`

      // Get first day of month and total days
      const firstDay = new Date(currentYear, currentMonth, 1).getDay()
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

      // Previous month days
      const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()
      for (let i = firstDay - 1; i >= 0; i--) {
        const dateDiv = document.createElement("div")
        dateDiv.className = "calendar-date other-month"
        dateDiv.innerHTML = `<div class="date-number">${prevMonthDays - i}</div>`
        calendarDates.appendChild(dateDiv)
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const dateDiv = document.createElement("div")
        dateDiv.className = "calendar-date"

        // Check if it's today
        if (
          currentYear === currentDate.getFullYear() &&
          currentMonth === currentDate.getMonth() &&
          i === currentDate.getDate()
        ) {
          dateDiv.classList.add("today")
        }

        dateDiv.innerHTML = `<div class="date-number">${i}</div>`

        // Add event dots
        const eventsDiv = document.createElement("div")
        eventsDiv.className = "date-events"

        // Check for appointments on this date
        const dateAppointments = appointments.filter(
          (appointment) =>
            appointment.date.getFullYear() === currentYear &&
            appointment.date.getMonth() === currentMonth &&
            appointment.date.getDate() === i,
        )

        // Create unique status dots
        const statuses = [...new Set(dateAppointments.map((app) => app.status))]
        statuses.forEach((status) => {
          const dot = document.createElement("div")
          dot.className = `event-dot ${status}`
          eventsDiv.appendChild(dot)
        })

        dateDiv.appendChild(eventsDiv)
        calendarDates.appendChild(dateDiv)
      }

      // Next month days
      const totalCells = 42 // 6 rows x 7 days
      const remainingCells = totalCells - (firstDay + daysInMonth)
      for (let i = 1; i <= remainingCells; i++) {
        const dateDiv = document.createElement("div")
        dateDiv.className = "calendar-date other-month"
        dateDiv.innerHTML = `<div class="date-number">${i}</div>`
        calendarDates.appendChild(dateDiv)
      }
    }

    // Initial render
    renderCalendar()

    // Month navigation
    prevMonthBtn.addEventListener("click", () => {
      currentMonth--
      if (currentMonth < 0) {
        currentMonth = 11
        currentYear--
      }
      renderCalendar()
    })

    nextMonthBtn.addEventListener("click", () => {
      currentMonth++
      if (currentMonth > 11) {
        currentMonth = 0
        currentYear++
      }
      renderCalendar()
    })
  }

  // Initialize calendar if it exists
  if (document.getElementById("calendar-dates")) {
    generateCalendar()
  }

  // Responsive handling
  // function handleResize() {
  //   if (window.innerWidth <= 992) {
  //     sidebar.classList.remove("active")
  //     mainContent.style.marginLeft = "0"
  //   } else {
  //     mainContent.style.marginLeft = sidebar.classList.contains("active") ? `${sidebar.offsetWidth}px` : "0"
  //   }
  // }

  // window.addEventListener("resize", handleResize)
  // handleResize()
})

