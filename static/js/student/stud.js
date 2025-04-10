document.addEventListener("DOMContentLoaded", function () {
    const counselorDropdown = document.querySelector("select[name='counselor_id']");
    const calendarElement = document.getElementById("appointmentCalendar");
    const appointmentDateInput = document.getElementById("appointmentDate");
    const timeSlotDropdown = document.getElementById("timeSlotDropdown"); // Add this line for dropdown
    const bookingForm = document.getElementById("bookingForm");

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let selectedDate = null;

    const fullDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const renderCalendar = (month, year, availableDays = []) => {
        console.log("Rendering calendar with:", { month, year, availableDays });
        calendarElement.innerHTML = "";

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Calendar navigation
        const nav = document.createElement("div");
        nav.style.display = "flex";
        nav.style.alignItems = "center";
        nav.style.justifyContent = "space-between";
        nav.style.marginBottom = "10px";
        nav.style.fontWeight = "bold";

        const prevButton = document.createElement("button");
        prevButton.textContent = "<";
        prevButton.style.cursor = "pointer";
        prevButton.style.fontSize = "16px";
        prevButton.style.padding = "8px 12px";
        prevButton.style.color = "#fff";
        prevButton.style.backgroundColor = "#4F46E5";
        prevButton.style.border = "none";
        prevButton.style.borderRadius = "3px";
        prevButton.style.margin = "10px";
        prevButton.onclick = () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            fetchAvailability(counselorDropdown.value);
        };

        const nextButton = document.createElement("button");
        nextButton.textContent = ">";
        nextButton.style.cursor = "pointer";
        nextButton.style.fontSize = "16px";
        nextButton.style.padding = "8px 12px";
        nextButton.style.color = "#fff";
        nextButton.style.backgroundColor = "#4F46E5";
        nextButton.style.border = "none";
        nextButton.style.borderRadius = "3px";
        nextButton.style.margin = "10px";
        nextButton.onclick = () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            fetchAvailability(counselorDropdown.value);
        };

        const header = document.createElement("div");
        header.textContent = `${monthNames[month]} ${year}`;
        header.style.flexGrow = "1";
        header.style.textAlign = "center";

        nav.appendChild(prevButton);
        nav.appendChild(header);
        nav.appendChild(nextButton);
        calendarElement.appendChild(nav);

        // Days of the week row
        const daysRow = document.createElement("div");
        daysRow.style.display = "grid";
        daysRow.style.gridTemplateColumns = "repeat(7, 1fr)";
        daysRow.style.textAlign = "center";
        daysRow.style.fontWeight = "bold";
        daysRow.style.marginBottom = "10px";

        shortDaysOfWeek.forEach((day) => {
            const dayElement = document.createElement("div");
            dayElement.textContent = day;
            daysRow.appendChild(dayElement);
        });
        calendarElement.appendChild(daysRow);

        // Calendar dates
        const datesGrid = document.createElement("div");
        datesGrid.style.display = "grid";
        datesGrid.style.gridTemplateColumns = "repeat(7, 1fr)";
        datesGrid.style.textAlign = "center";

        for (let i = 0; i < firstDay; i++) {
            const emptySlot = document.createElement("div");
            datesGrid.appendChild(emptySlot);
        }

        for (let date = 1; date <= daysInMonth; date++) {
            const dateObj = new Date(year, month, date);
            const dayName = fullDaysOfWeek[dateObj.getDay()];
            const isPastDay = dateObj < today.setHours(0, 0, 0, 0);
            const isAvailable = availableDays.includes(dayName);

            const dateElement = document.createElement("div");
            dateElement.textContent = date;
            dateElement.style.padding = "10px";
            dateElement.style.border = "1px solid #ddd";
            dateElement.style.borderRadius = "5px";

            if (isPastDay) {
                dateElement.style.color = "#aaa";
                dateElement.style.backgroundColor = "#f5f5f5";
                dateElement.style.cursor = "not-allowed";
            } else if (isAvailable) {
                dateElement.style.cursor = "pointer";
                dateElement.style.color = "#fff";
                dateElement.style.backgroundColor = "#4F46E5";
                dateElement.onclick = () => {
                    if (selectedDate) {
                        selectedDate.style.backgroundColor = "#4F46E5";
                    }
                    dateElement.style.backgroundColor = "green";
                    selectedDate = dateElement;

                    const selectedDateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
                    console.log(selectedDateString);
                    
                    appointmentDateInput.value = selectedDateString;
                    fetchTimeSlots(counselorDropdown.value, selectedDateString);

                


                    // const selectedDateString = `${String(date).padStart(2, "0")}-${String(month + 1).padStart(2, "0")}-${year}`;
                    // appointmentDateInput.value = selectedDateString;
                    // console.log(selectedDateString);
                    
                    // fetchTimeSlots(counselorDropdown.value, `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`);
                };
            } else {
                dateElement.style.color = "#aaa";
                dateElement.style.backgroundColor = "#f5f5f5";
                dateElement.style.cursor = "not-allowed";
            }

            datesGrid.appendChild(dateElement);
        }

        calendarElement.appendChild(datesGrid);
    };

    const fetchAvailability = (counselorId) => {
        if (!counselorId) {
            renderCalendar(currentMonth, currentYear, []); // Clear highlights
            return;
        }

        fetch(`/get_availability/${counselorId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.available_days) {
                    console.log(data)
                    renderCalendar(currentMonth, currentYear, data.available_days);
                } else {
                    renderCalendar(currentMonth, currentYear, []); // No availability
                }
            })
            .catch((error) => console.error("Error fetching availability:", error));
    };

     const fetchTimeSlots = (counselorId, selectedDate) => {
        timeSlotDropdown.innerHTML = "<option value=''>Select time</option>"; // Clear previous time slots

        fetch(`/get-time-slots-for-date/${counselorId}/${selectedDate}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    data.time_slots.forEach((slot) => {
                        const option = document.createElement("option");
                        option.value = slot;
                        option.textContent = slot;
                        timeSlotDropdown.appendChild(option);
                    });
                } else {
                    timeSlotDropdown.innerHTML = "<option value=''>No time slots available</option>";
                }
            })
            .catch((error) => {
                console.error("Error fetching time slots:", error);
                timeSlotDropdown.innerHTML = "<option value=''>Error fetching time slots</option>";
            });
    };

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedCounselorId = urlParams.get("counselor_id");

    if (preselectedCounselorId) {
        counselorDropdown.value = preselectedCounselorId;
        fetchAvailability(preselectedCounselorId);
    } else {
        renderCalendar(currentMonth, currentYear); // Default calendar
    }

    counselorDropdown.addEventListener("change", function () {
        fetchAvailability(counselorDropdown.value);
    });

    appointmentDateInput.addEventListener("change", function () {
        const counselorId = counselorDropdown.value;
        const selectedDate = appointmentDateInput.value;
        if (counselorId && selectedDate) {
            fetchTimeSlots(counselorId, selectedDate);
        }
    });
});
