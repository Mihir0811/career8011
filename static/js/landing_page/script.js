document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(faqItem => {
                    faqItem.classList.remove('active');
                    const answer = faqItem.querySelector('.faq-answer');
                    answer.style.maxHeight = null;
                });
                
                // If the clicked item wasn't active, open it
                if (!isActive) {
                    item.classList.add('active');
                    const answer = item.querySelector('.faq-answer');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });

        // Open the first FAQ item by default
        if (faqItems[0]) {
            faqItems[0].classList.add('active');
            const firstAnswer = faqItems[0].querySelector('.faq-answer');
            if (firstAnswer) {
                firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
            }
        }
    }

    // Testimonial Slider
    const testimonialTrack = document.querySelector('.testimonial-track');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const prevButton = document.querySelector('.testimonial-prev');
    const nextButton = document.querySelector('.testimonial-next');
    
    if (testimonialTrack && testimonialCards.length > 0) {
        let currentIndex = 0;
        const cardWidth = testimonialCards[0].offsetWidth;
        
        // Set initial position
        testimonialTrack.style.transform = `translateX(0)`;
        
        // Update dots
        function updateDots() {
            testimonialDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        // Move to specific slide
        function moveToSlide(index) {
            currentIndex = index;
            testimonialTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        }
        
        // Next slide
        function nextSlide() {
            currentIndex = (currentIndex + 1) % testimonialCards.length;
            moveToSlide(currentIndex);
        }
        
        // Previous slide
        function prevSlide() {
            currentIndex = (currentIndex - 1 + testimonialCards.length) % testimonialCards.length;
            moveToSlide(currentIndex);
        }
        
        // Event listeners
        if (nextButton) {
            nextButton.addEventListener('click', nextSlide);
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', prevSlide);
        }
        
        // Dot navigation
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                moveToSlide(index);
            });
        });
        
        // Auto slide
        let interval = setInterval(nextSlide, 5000);
        
        // Pause on hover
        testimonialTrack.addEventListener('mouseenter', () => {
            clearInterval(interval);
        });
        
        testimonialTrack.addEventListener('mouseleave', () => {
            interval = setInterval(nextSlide, 5000);
        });
    }

    // Resource Filtering
    const resourceFilterButtons = document.querySelectorAll('.resource-filter-btn');
    const resourceCards = document.querySelectorAll('.resource-card');
    
    if (resourceFilterButtons.length > 0 && resourceCards.length > 0) {
        resourceFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                resourceFilterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get filter value
                const filter = button.getAttribute('data-filter');
                
                // Filter resources
                resourceCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // FAQ Category Navigation
    const categoryLinks = document.querySelectorAll('.category-card');
    const faqCategories = document.querySelectorAll('.faq-category');
    
    if (categoryLinks.length > 0 && faqCategories.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                categoryLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Get category ID
                const categoryId = link.getAttribute('href').substring(1);
                
                // Hide all categories
                faqCategories.forEach(category => {
                    category.classList.remove('active');
                });
                
                // Show selected category
                document.getElementById(categoryId).classList.add('active');
                
                // Scroll to category
                document.getElementById(categoryId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    }

    // FAQ Search
    const faqSearchInput = document.getElementById('faqSearch');
    const faqItems2 = document.querySelectorAll('.faq-item');
    const popularSearches = document.querySelectorAll('.popular-searches a');
    
    if (faqSearchInput && faqItems2.length > 0) {
        faqSearchInput.addEventListener('input', () => {
            const searchTerm = faqSearchInput.value.toLowerCase();
            
            faqItems2.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        
        // Popular searches
        popularSearches.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const searchTerm = link.getAttribute('data-search');
                faqSearchInput.value = searchTerm;
                
                // Trigger input event to filter FAQs
                const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                
                faqSearchInput.dispatchEvent(inputEvent);
            });
        });
    }

    // Contact Form Validation
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            // Name validation
            const nameInput = document.getElementById('name');
            const nameError = document.getElementById('nameError');
            
            if (!nameInput.value.trim()) {
                nameError.textContent = 'Please enter your name';
                nameInput.classList.add('error');
                isValid = false;
            } else {
                nameError.textContent = '';
                nameInput.classList.remove('error');
            }
            
            // Email validation
            const emailInput = document.getElementById('email');
            const emailError = document.getElementById('emailError');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailInput.value.trim()) {
                emailError.textContent = 'Please enter your email address';
                emailInput.classList.add('error');
                isValid = false;
            } else if (!emailPattern.test(emailInput.value)) {
                emailError.textContent = 'Please enter a valid email address';
                emailInput.classList.add('error');
                isValid = false;
            } else {
                emailError.textContent = '';
                emailInput.classList.remove('error');
            }
            
            // Subject validation
            const subjectInput = document.getElementById('subject');
            const subjectError = document.getElementById('subjectError');
            
            if (!subjectInput.value) {
                subjectError.textContent = 'Please select a subject';
                subjectInput.classList.add('error');
                isValid = false;
            } else {
                subjectError.textContent = '';
                subjectInput.classList.remove('error');
            }
            
            // Message validation
            const messageInput = document.getElementById('message');
            const messageError = document.getElementById('messageError');
            
            if (!messageInput.value.trim()) {
                messageError.textContent = 'Please enter your message';
                messageInput.classList.add('error');
                isValid = false;
            } else if (messageInput.value.trim().length < 10) {
                messageError.textContent = 'Message must be at least 10 characters long';
                messageInput.classList.add('error');
                isValid = false;
            } else {
                messageError.textContent = '';
                messageInput.classList.remove('error');
            }
            
            // Privacy checkbox validation
            const privacyCheckbox = document.getElementById('privacy');
            const privacyError = document.getElementById('privacyError');
            
            if (!privacyCheckbox.checked) {
                privacyError.textContent = 'You must agree to the Privacy Policy';
                isValid = false;
            } else {
                privacyError.textContent = '';
            }
            
            // If form is valid, submit it
            if (isValid) {
                const submitBtn = contactForm.querySelector('.submit-btn');
                submitBtn.classList.add('loading');
                
                // Simulate form submission
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    contactForm.reset();
                    
                    // Show success modal
                    const successModal = document.getElementById('successModal');
                    if (successModal) {
                        successModal.classList.add('active');
                    }
                }, 2000);
            }
        });
    }

    // Success Modal
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');
    const modalBtn = document.querySelector('.modal-btn');
    
    if (successModal && closeModal && modalBtn) {
        closeModal.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
        
        modalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }

    // Google Maps
    function initMap() {
        const mapElement = document.getElementById('map');
        
        if (mapElement) {
            const location = { lat: 40.7128, lng: -74.0060 }; // New York coordinates
            
            const map = new google.maps.Map(mapElement, {
                zoom: 15,
                center: location,
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "weight": "2.00"
                            }
                        ]
                    },
                    {
                        "featureType": "all",
                        "elementType": "geometry.stroke",
                        "stylers": [
                            {
                                "color": "#9c9c9c"
                            }
                        ]
                    },
                    {
                        "featureType": "all",
                        "elementType": "labels.text",
                        "stylers": [
                            {
                                "visibility": "on"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "all",
                        "stylers": [
                            {
                                "color": "#f2f2f2"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#ffffff"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#ffffff"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "all",
                        "stylers": [
                            {
                                "saturation": -100
                            },
                            {
                                "lightness": 45
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#eeeeee"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.text.fill",
                        "stylers": [
                            {
                                "color": "#7b7b7b"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.text.stroke",
                        "stylers": [
                            {
                                "color": "#ffffff"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "all",
                        "stylers": [
                            {
                                "color": "#46bcec"
                            },
                            {
                                "visibility": "on"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry.fill",
                        "stylers": [
                            {
                                "color": "#c8d7d4"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text.fill",
                        "stylers": [
                            {
                                "color": "#070707"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text.stroke",
                        "stylers": [
                            {
                                "color": "#ffffff"
                            }
                        ]
                    }
                ]
            });
            
            const marker = new google.maps.Marker({
                position: location,
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4A90E2',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF'
                },
                title: 'CareerConnect Headquarters'
            });
            
            const infoWindow = new google.maps.InfoWindow({
                content: '<div style="padding: 10px;"><strong>CareerConnect Headquarters</strong><br>123 Education Street<br>Academic City, ST 12345</div>'
            });
            
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        }
    }

    // Initialize map if Google Maps API is loaded
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
        initMap();
    } else {
        // If Google Maps API is not loaded, use placeholder image
        const mapElement = document.getElementById('map');
        if (mapElement) {
            const placeholderImg = document.createElement('img');
            placeholderImg.src = 'https://placeholder.svg?height=400&width=600';
            placeholderImg.alt = 'Map Location';
            placeholderImg.className = 'placeholder-map';
            mapElement.appendChild(placeholderImg);
        }
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's a FAQ category link (handled separately)
            if (document.querySelector('.category-card[href="' + href + '"]')) {
                return;
            }
            
            if (href !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Timeline Animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length > 0) {
        const animateTimeline = () => {
            timelineItems.forEach(item => {
                const itemTop = item.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (itemTop < windowHeight * 0.8) {
                    item.classList.add('animate');
                }
            });
        };
        
        // Initial check
        animateTimeline();
        
        // Check on scroll
        window.addEventListener('scroll', animateTimeline);
    }

    // Team Card Hover Effect
    const teamCards = document.querySelectorAll('.team-card');
    
    if (teamCards.length > 0) {
        teamCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hover');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hover');
            });
        });
    }

    // Counselor Filter
    const filterBtn = document.querySelector('.filter-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const counselorCards = document.querySelectorAll('.counselor-card');
    
    if (filterBtn && resetBtn && counselorCards.length > 0) {
        filterBtn.addEventListener('click', () => {
            const specialization = document.getElementById('specialization').value;
            const experience = document.getElementById('experience').value;
            const availability = document.getElementById('availability').value;
            
            counselorCards.forEach(card => {
                // In a real application, you would check the counselor's data attributes
                // For this demo, we'll just add a random filter effect
                if (Math.random() > 0.5) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                }
            });
        });
        
        resetBtn.addEventListener('click', () => {
            document.getElementById('specialization').value = '';
            document.getElementById('experience').value = '';
            document.getElementById('availability').value = '';
            
            counselorCards.forEach(card => {
                card.style.display = 'flex';
            });
        });
    }

    // Pagination
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    const paginationPrev = document.querySelector('.pagination-prev');
    const paginationNext = document.querySelector('.pagination-next');
    
    if (paginationNumbers.length > 0) {
        paginationNumbers.forEach(number => {
            number.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all numbers
                paginationNumbers.forEach(num => num.classList.remove('active'));
                
                // Add active class to clicked number
                number.classList.add('active');
                
                // Enable/disable prev/next buttons
                if (number.textContent === '1') {
                    paginationPrev.classList.add('disabled');
                } else {
                    paginationPrev.classList.remove('disabled');
                }
                
                if (number.textContent === '10') {
                    paginationNext.classList.add('disabled');
                } else {
                    paginationNext.classList.remove('disabled');
                }
                
                // In a real application, you would load the corresponding page of results
                // For this demo, we'll just scroll to the top of the counselor profiles section
                document.querySelector('.counselor-profiles').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
        
        if (paginationPrev) {
            paginationPrev.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (paginationPrev.classList.contains('disabled')) {
                    return;
                }
                
                // Find current active page
                const activePage = document.querySelector('.pagination-number.active');
                const currentPage = parseInt(activePage.textContent);
                
                if (currentPage > 1) {
                    // Find previous page number
                    const prevPage = document.querySelector(`.pagination-number:nth-child(${currentPage})`);
                    
                    // Trigger click on previous page
                    if (prevPage) {
                        prevPage.click();
                    }
                }
            });
        }
        
        if (paginationNext) {
            paginationNext.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (paginationNext.classList.contains('disabled')) {
                    return;
                }
                
                // Find current active page
                const activePage = document.querySelector('.pagination-number.active');
                const currentPage = parseInt(activePage.textContent);
                
                if (currentPage < 10) {
                    // Find next page number
                    const nextPage = document.querySelector(`.pagination-number:nth-child(${currentPage + 2})`);
                    
                    // Trigger click on next page
                    if (nextPage) {
                        nextPage.click();
                    }
                }
            });
        }
    }

    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                // In a real application, you would submit the form to your server
                // For this demo, we'll just show a success message
                emailInput.value = '';
                
                // Create success message
                const successMessage = document.createElement('div');
                successMessage.className = 'newsletter-success';
                successMessage.textContent = 'Thank you for subscribing!';
                
                // Add success message after the form
                newsletterForm.parentNode.appendChild(successMessage);
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
            }
        });
    }
});