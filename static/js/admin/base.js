document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    

    // Charts
    if (typeof Chart !== 'undefined') {
        // Registration Trends Chart
        const registrationCtx = document.getElementById('registrationChart')?.getContext('2d');
        if (registrationCtx) {
            new Chart(registrationCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Students',
                            data: [65, 78, 90, 85, 95, 110],
                            borderColor: '#4F46E5',
                            tension: 0.3
                        },
                        {
                            label: 'Counselors',
                            data: [25, 28, 32, 30, 35, 38],
                            borderColor: '#10B981',
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Interests Chart
        fetch('/popular_interests')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const labels = data.data.map(item => item.interest);
                const counts = data.data.map(item => item.count);

                const predefinedColors = [
                    '#4F46E5', 
                    '#10B981',  
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6', 
                    '#3B82F6',  
                    '#F43F5E',  
                    '#14B8A6',  
                    '#F97316',  
                    '#22C55E'
                ];

                const backgroundColors = labels.map((_, index) => 
                    predefinedColors[index % predefinedColors.length]
                );

                const borderColors = backgroundColors.map(color => 
                    color
                );

                new Chart(document.getElementById('interestsChart'), {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Popular Interests',
                            data: counts,
                            backgroundColor: backgroundColors,
                            borderColor: borderColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });


            } else {
                console.error(data.message);
            }
        });
    }

    // Modal Handling
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-btn');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
        });
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.classList.remove('active');
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Form Submissions
    

    // Table Search and Filter
    const tableSearchInputs = document.querySelectorAll('.search-box input');
    const filterSelects = document.querySelectorAll('.filter-select');

    tableSearchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const tableRows = input.closest('.section').querySelectorAll('tbody tr');

            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    });

    filterSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const filterValue = e.target.value.toLowerCase();
            const tableRows = select.closest('.section').querySelectorAll('tbody tr');

            if (!filterValue) {
                tableRows.forEach(row => row.style.display = '');
                return;
            }

            tableRows.forEach(row => {
                const matchesFilter = row.textContent.toLowerCase().includes(filterValue);
                row.style.display = matchesFilter ? '' : 'none';
            });
        });
    });
});