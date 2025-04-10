document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const mainContent = document.querySelector(".main-content");
    const notificationBtn = document.getElementById("notificationBtn");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const profileBtn = document.getElementById("profileBtn");
    const profileMenu = document.getElementById("profileMenu");
    const markAllReadBtn = document.querySelector(".mark-all-read");
    const progressCircle = document.querySelector(".progress-circle");
  
    // Toggle Sidebar
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target)
      ) {
        sidebar.classList.remove("active");
      }
    });
  
    // Toggle Notification Dropdown
    notificationBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationDropdown?.classList.toggle("active");
      profileMenu?.classList.remove("active");
    });
  
    // Toggle Profile Menu
    profileBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu?.classList.toggle("active");
      notificationDropdown?.classList.remove("active");
    });
  
    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
      if (!notificationBtn?.contains(e.target)) {
        notificationDropdown?.classList.remove("active");
      }
      if (!profileBtn?.contains(e.target)) {
        profileMenu?.classList.remove("active");
      }
    });
  
    // Mark all notifications as read
    markAllReadBtn?.addEventListener("click", () => {
      const unreadNotifications = document.querySelectorAll(".notification-item.unread");
      unreadNotifications.forEach((notification) => {
        notification.classList.remove("unread");
      });
      const badge = document.querySelector(".notification-badge");
      if (badge) badge.style.display = "none";
    });
  
    // Initialize Chart.js
    // const ctx = document.getElementById("interestsChart");
    // if (ctx) {
    //   try {
    //     new Chart(ctx, {
    //       type: "doughnut",
    //       data: {
    //         labels: ["Technology", "Business", "Design"],
    //         datasets: [
    //           {
    //             data: [45, 30, 25],
    //             backgroundColor: ["#4F46E5", "#10B981", "#F59E0B"],
    //             borderWidth: 0,
    //           },
    //         ],
    //       },
    //       options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         animation: {
    //           duration: 0, // Disable animations to prevent unwanted transitions
    //         },
    //         plugins: {
    //           legend: {
    //             display: false,
    //           },
    //         },
    //         cutout: "75%",
    //       },
    //     });
    //   } catch (error) {
    //     console.error("Error initializing Chart.js:", error);
    //   }
    // }
  
    // Active link handling
    const navLinks = document.querySelectorAll(".sidebar-nav a");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        navLinks.forEach((l) => l.parentElement.classList.remove("active"));
        this.parentElement.classList.add("active");
      });
    });
  
    // Progress Circle Animation
    function setProgress(element, progress) {
      const percentage = Math.min(100, Math.max(0, progress));
      const degrees = (percentage / 100) * 360;
      element.style.background = `conic-gradient(
          var(--primary-color) ${degrees}deg,
          var(--border-color) 0deg
      )`;
    }
  
    if (progressCircle) {
      const progress = Number.parseInt(progressCircle.getAttribute("data-progress"));
      setProgress(progressCircle, progress);
    }
  
    // Responsive handling
    function handleResize() {
      if (window.innerWidth <= 768) {
        sidebar?.classList.remove("active");
        mainContent.style.marginLeft = "0";
      } else {
        mainContent.style.marginLeft = `${sidebar.offsetWidth}px`;
      }
    }
  
    window.addEventListener("resize", handleResize);
    handleResize();
  });
  