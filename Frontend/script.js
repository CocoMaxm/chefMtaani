

        // Sample data for chefs
        const chefsData = {
            'Italian': [
                {id: 1, name: 'Marco Rossi', rating: 5, price: 150, bio: 'Authentic Italian chef with 15 years experience', avatar: 'https://i.pravatar.cc/150?img=11'},
                {id: 2, name: 'Giulia Romano', rating: 4.8, price: 120, bio: 'Specializes in Northern Italian cuisine', avatar: 'https://i.pravatar.cc/150?img=31'},
                {id: 3, name: 'Antonio Verdi', rating: 4.9, price: 180, bio: 'Michelin-trained chef from Rome', avatar: 'https://i.pravatar.cc/150?img=12'}
            ],
            'French': [
                {id: 4, name: 'Pierre Dubois', rating: 5, price: 200, bio: 'Classical French cuisine expert', avatar: 'https://i.pravatar.cc/150?img=13'},
                {id: 5, name: 'Sophie Martin', rating: 4.9, price: 175, bio: 'Modern French fusion specialist', avatar: 'https://i.pravatar.cc/150?img=32'}
            ],
            'Asian': [
                {id: 6, name: 'Kenji Tanaka', rating: 4.9, price: 160, bio: 'Japanese sushi master', avatar: 'https://i.pravatar.cc/150?img=14'},
                {id: 7, name: 'Wei Chen', rating: 4.7, price: 130, bio: 'Szechuan cuisine specialist', avatar: 'https://i.pravatar.cc/150?img=15'},
                {id: 8, name: 'Priya Patel', rating: 4.8, price: 140, bio: 'Thai and Vietnamese fusion', avatar: 'https://i.pravatar.cc/150?img=33'}
            ],
            'Mexican': [
                {id: 9, name: 'Carlos Rodriguez', rating: 4.8, price: 110, bio: 'Traditional Mexican street food', avatar: 'https://i.pravatar.cc/150?img=16'},
                {id: 10, name: 'Maria Gonzalez', rating: 4.9, price: 125, bio: 'Regional Mexican specialties', avatar: 'https://i.pravatar.cc/150?img=34'}
            ],
            'Indian': [
                {id: 11, name: 'Raj Kumar', rating: 5, price: 135, bio: 'North Indian cuisine expert', avatar: 'https://i.pravatar.cc/150?img=17'},
                {id: 12, name: 'Anita Sharma', rating: 4.8, price: 145, bio: 'South Indian vegetarian specialist', avatar: 'https://i.pravatar.cc/150?img=35'}
            ],
            'Mediterranean': [
                {id: 13, name: 'Nikos Papadopoulos', rating: 4.9, price: 155, bio: 'Greek and Turkish cuisine', avatar: 'https://i.pravatar.cc/150?img=18'},
                {id: 14, name: 'Elena Costa', rating: 4.7, price: 140, bio: 'Spanish tapas and paella expert', avatar: 'https://i.pravatar.cc/150?img=36'}
            ]
        };

        // Store bookings in memory (in production, this would be in MongoDB)
        let bookings = {};
        let currentChef = null;
        let selectedDate = null;

        // Page navigation
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
            });
            document.getElementById(pageId).style.display = 'block';
            window.scrollTo(0, 0);
        }

        // Show chefs for selected cuisine
        function showChefs(cuisine) {
            const chefsList = document.getElementById('chefsList');
            const chefs = chefsData[cuisine] || [];
            
            document.getElementById('selectedCuisineTitle').textContent = `${cuisine} Chefs`;
            
            chefsList.innerHTML = chefs.map(chef => `
                <div class="col-lg-6">
                    <div class="chef-card">
                        <div class="d-flex">
                            <img src="${chef.avatar}" alt="${chef.name}" class="chef-avatar me-3">
                            <div class="flex-grow-1">
                                <h5>${chef.name}</h5>
                                <div class="chef-rating mb-2">
                                    ${generateStars(chef.rating)}
                                    <span class="text-muted ms-2">(${chef.rating})</span>
                                </div>
                                <p class="mb-2">${chef.bio}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="h5 mb-0 text-primary">${chef.price}/hour</span>
                                    <button class="btn btn-primary" onclick="openBookingModal(${chef.id}, '${chef.name}', ${chef.price})">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('cuisineCards').style.display = 'none';
            document.getElementById('chefDisplaySection').style.display = 'block';
        }

        // Hide chefs and show cuisines
        function hideChefs() {
            document.getElementById('cuisineCards').style.display = 'flex';
            document.getElementById('chefDisplaySection').style.display = 'none';
        }

        // Generate star rating HTML
        function generateStars(rating) {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5;
            let stars = '';
            
            for (let i = 0; i < fullStars; i++) {
                stars += '<i class="fas fa-star"></i>';
            }
            if (halfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            }
            return stars;
        }

        // Open booking modal
        function openBookingModal(chefId, chefName, price) {
            currentChef = {id: chefId, name: chefName, price: price};
            document.getElementById('modalChefName').textContent = chefName;
            generateCalendar();
            const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
            modal.show();
        }

        // Generate calendar
        function generateCalendar() {
            const calendar = document.getElementById('bookingCalendar');
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            // Get chef's bookings
            const chefBookings = bookings[currentChef.id] || [];
            
            let html = '<div class="row g-1">';
            
            // Add day headers
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach(day => {
                html += `<div class="col text-center fw-bold p-2">${day}</div>`;
            });
            html += '</div><div class="row g-1">';
            
            // Get first day of month
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            
            // Add empty cells for days before month starts
            for (let i = 0; i < firstDay; i++) {
                html += '<div class="col"></div>';
            }
            
            // Add days of month
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dateStr = date.toISOString().split('T')[0];
                const isPast = date < today;
                const isBooked = chefBookings.includes(dateStr);
                
                let className = 'calendar-day';
                if (isPast) className += ' text-muted';
                else if (isBooked) className += ' booked';
                else className += ' available';
                
                html += `<div class="col ${className}" ${!isPast && !isBooked ? `onclick="selectDate('${dateStr}')"` : ''}>
                    ${day}
                </div>`;
                
                // Start new row after Saturday
                if ((firstDay + day) % 7 === 0) {
                    html += '</div><div class="row g-1">';
                }
            }
            
            html += '</div>';
            calendar.innerHTML = html;
        }

        // Select date
        function selectDate(date) {
            selectedDate = date;
            document.getElementById('bookingDate').value = new Date(date).toLocaleDateString();
        }

        // Confirm booking
        function confirmBooking() {
            if (!selectedDate) {
                alert('Please select a date');
                return;
            }
            
            const time = document.getElementById('bookingTime').value;
            const duration = document.getElementById('bookingDuration').value;
            const guests = document.getElementById('bookingGuests').value;
            const address = document.getElementById('bookingAddress').value;
            const notes = document.getElementById('bookingNotes').value;
            
            if (!time || !address) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Add booking to chef's calendar
            if (!bookings[currentChef.id]) {
                bookings[currentChef.id] = [];
            }
            bookings[currentChef.id].push(selectedDate);
            
            // In production, this would send an email to the chef
            alert(`Booking confirmed!\n\nChef ${currentChef.name} has been notified of your booking for ${selectedDate} at ${time} for ${duration} hours at ${address}.`);
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
            
            // Reset form
            document.getElementById('bookingForm').reset();
            selectedDate = null;
        }

        // Stats counter animation
        function animateStats() {
            const stats = document.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                let current = 0;
                const increment = target / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(current);
                }, 20);
            });
        }

        // Contact form submission
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you within 24 hours.');
            this.reset();
        });

        // Chef login form
        document.getElementById('chefLoginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // In production, this would validate against MongoDB
            document.getElementById('authTabs').style.display = 'none';
            document.getElementById('authTabContent').style.display = 'none';
            document.getElementById('chefDashboard').style.display = 'block';
            document.getElementById('chefName').textContent = 'Demo Chef';
            document.getElementById('dashboardCuisine').textContent = 'Italian';
            document.getElementById('dashboardPrice').textContent = '150';
            document.getElementById('dashboardLocation').textContent = 'New York, NY';
            
            // Show sample bookings
            document.getElementById('bookingsList').innerHTML = `
                <div class="mb-2">
                    <strong>June 25, 2024</strong> - 6:00 PM - 3 hours<br>
                    <small class="text-muted">123 Main St, New York</small>
                </div>
                <div class="mb-2">
                    <strong>June 28, 2024</strong> - 7:00 PM - 4 hours<br>
                    <small class="text-muted">456 Oak Ave, Brooklyn</small>
                </div>
            `;
        });

        // Chef signup form
        document.getElementById('chefSignupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your application! Our team will review your profile and contact you within 48 hours.');
            this.reset();
        });

        // Logout function
        function logout() {
            document.getElementById('authTabs').style.display = 'block';
            document.getElementById('authTabContent').style.display = 'block';
            document.getElementById('chefDashboard').style.display = 'none';
        }

        // Initialize stats animation when scrolling to stats section
        let statsAnimated = false;
        window.addEventListener('scroll', function() {
            const statsSection = document.querySelector('.stats-section');
            if (!statsAnimated && statsSection) {
                const rect = statsSection.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    animateStats();
                    statsAnimated = true;
                }
            }
        });

        // Initialize carousel
        document.addEventListener('DOMContentLoaded', function() {
            new bootstrap.Carousel(document.getElementById('heroCarousel'), {
                interval: 5000
            });
        });





// 2. Updated HTML file with API integration
// Add this script section to your existing HTML file before the closing </body> tag:

// Global state management
const appState = {
  user: null,
  token: null,
  chefs: [],
  bookings: [],
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  // Check for saved auth token
  const savedToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('user');
  
  if (savedToken && savedUser) {
    appState.token = savedToken;
    appState.user = JSON.parse(savedUser);
    updateUIForAuthenticatedUser();
  }

  // Initialize components
  initializeAuthForms();
  initializeCuisinesPage();
  initializeContactForm();
  loadInitialData();
});

// Authentication Functions
function initializeAuthForms() {
  // Customer Registration
  const customerRegForm = document.getElementById('customerRegistrationForm');
  if (customerRegForm) {
    customerRegForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
      };

      try {
        showLoader();
        const response = await api.auth.register(formData);
        
        // Save token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        appState.token = response.token;
        appState.user = response.user;
        
        alert('Registration successful!');
        updateUIForAuthenticatedUser();
        showPage('homePage');
      } catch (error) {
        alert('Registration failed: ' + error.message);
      } finally {
        hideLoader();
      }
    });
  }

  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const credentials = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
      };

      try {
        showLoader();
        const response = await api.auth.login(credentials);
        
        // Save token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        appState.token = response.token;
        appState.user = response.user;
        
        alert('Login successful!');
        updateUIForAuthenticatedUser();
        showPage('homePage');
      } catch (error) {
        alert('Login failed: ' + error.message);
      } finally {
        hideLoader();
      }
    });
  }

  // Chef Registration
  const chefSignupForm = document.getElementById('chefSignupForm');
  if (chefSignupForm) {
    chefSignupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const chefData = {
        firstName: document.getElementById('signupFirstName').value,
        lastName: document.getElementById('signupLastName').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        bio: document.getElementById('signupBio').value,
        experience: parseInt(document.getElementById('signupExperience').value),
        cuisineSpecialization: document.getElementById('signupCuisine').value,
        hourlyRate: parseFloat(document.getElementById('signupPrice').value),
        serviceLocation: {
          city: document.getElementById('signupLocation').value.split(',')[0].trim(),
          state: document.getElementById('signupLocation').value.split(',')[1].trim(),
        },
      };

      try {
        showLoader();
        const response = await api.auth.registerChef(chefData);
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        appState.token = response.token;
        appState.user = response.user;
        
        alert('Chef registration successful! Your profile is under review.');
        updateUIForAuthenticatedUser();
        showChefDashboard(response.chef);
      } catch (error) {
        alert('Registration failed: ' + error.message);
      } finally {
        hideLoader();
      }
    });
  }

  // Chef Login - Update existing form
  const chefLoginForm = document.getElementById('chefLoginForm');
  if (chefLoginForm) {
    chefLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const credentials = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
      };

      try {
        showLoader();
        const response = await api.auth.login(credentials);
        
        if (response.user.role !== 'chef') {
          throw new Error('This login is for chefs only');
        }
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        appState.token = response.token;
        appState.user = response.user;
        
        // Load chef bookings
        const bookings = await api.bookings.getMy();
        showChefDashboard(response.user, bookings.data);
      } catch (error) {
        alert('Login failed: ' + error.message);
      } finally {
        hideLoader();
      }
    });
  }
}

// Update UI for authenticated users
function updateUIForAuthenticatedUser() {
  const navbarNav = document.getElementById('navbarNav');
  if (navbarNav && appState.user) {
    // Add user info and logout button to navbar
    const userNav = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
          <i class="fas fa-user"></i> ${appState.user.firstName}
        </a>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#" onclick="showMyBookings()">My Bookings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
        </ul>
      </li>
    `;
    
    const ul = navbarNav.querySelector('.navbar-nav');
    ul.insertAdjacentHTML('beforeend', userNav);
  }
}

// Logout function
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  appState.token = null;
  appState.user = null;
  window.location.reload();
}

// Load initial data
async function loadInitialData() {
  try {
    // Load cuisines for homepage stats
    const cuisinesResponse = await api.cuisines.getAll();
    updateCuisineStats(cuisinesResponse.data);
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
}

// Cuisines Page Functions
function initializeCuisinesPage() {
  // This will be called when showing chefs
  window.showChefs = async function(cuisine) {
    try {
      showLoader();
      
      // Fetch chefs for selected cuisine
      const response = await api.chefs.getAll({ cuisine });
      appState.chefs = response.data;
      
      // Update UI with real chef data
      displayChefs(cuisine, response.data);
    } catch (error) {
      alert('Error loading chefs: ' + error.message);
    } finally {
      hideLoader();
    }
  };
}

// Display chefs from API data
function displayChefs(cuisine, chefs) {
  const chefsList = document.getElementById('chefsList');
  document.getElementById('selectedCuisineTitle').textContent = `${cuisine} Chefs`;
  
  if (chefs.length === 0) {
    chefsList.innerHTML = '<p class="text-center">No chefs available for this cuisine at the moment.</p>';
  } else {
    chefsList.innerHTML = chefs.map(chef => `
      <div class="col-lg-6">
        <div class="chef-card">
          <div class="d-flex">
            <img src="${chef.profileImage || `https://i.pravatar.cc/150?u=${chef._id}`}" 
                 alt="${chef.user.firstName} ${chef.user.lastName}" 
                 class="chef-avatar me-3">
            <div class="flex-grow-1">
              <h5>${chef.user.firstName} ${chef.user.lastName}</h5>
              <div class="chef-rating mb-2">
                ${generateStars(chef.rating.average)}
                <span class="text-muted ms-2">(${chef.rating.average.toFixed(1)}) - ${chef.rating.count} reviews</span>
              </div>
              <p class="mb-2">${chef.bio}</p>
              <p class="text-muted mb-2">
                <i class="fas fa-map-marker-alt"></i> ${chef.serviceLocation.city}, ${chef.serviceLocation.state}
              </p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="h5 mb-0 text-primary">$${chef.hourlyRate}/hour</span>
                <button class="btn btn-primary" onclick="openBookingModal('${chef._id}', '${chef.user.firstName} ${chef.user.lastName}', ${chef.hourlyRate})">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  document.getElementById('cuisineCards').style.display = 'none';
  document.getElementById('chefDisplaySection').style.display = 'block';
}

// Update booking modal to check availability
window.openBookingModal = async function(chefId, chefName, price) {
  if (!appState.user) {
    alert('Please login to book a chef');
    showPage('loginPage'); // You'll need to create this page
    return;
  }

  currentChef = {id: chefId, name: chefName, price: price};
  document.getElementById('modalChefName').textContent = chefName;
  
  // Get chef availability for next 30 days
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  try {
    showLoader();
    const response = await api.chefs.getAvailability(
      chefId, 
      today.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    generateCalendar(response.data);
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
  } catch (error) {
    alert('Error loading availability: ' + error.message);
  } finally {
    hideLoader();
  }
};

// Update calendar generation to use real booking data
function generateCalendar(bookedDates = []) {
  const calendar = document.getElementById('bookingCalendar');
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let html = '<div class="row g-1">';
  
  // Add day headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    html += `<div class="col text-center fw-bold p-2">${day}</div>`;
  });
  html += '</div><div class="row g-1">';
  
  // Get first day of month
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="col"></div>';
  }
  
  // Add days of month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const isPast = date < today;
    const isBooked = bookedDates.includes(dateStr);
    
    let className = 'calendar-day';
    if (isPast) className += ' text-muted';
    else if (isBooked) className += ' booked';
    else className += ' available';
    
    html += `<div class="col ${className}" ${!isPast && !isBooked ? `onclick="selectDate('${dateStr}')"` : ''}>
      ${day}
    </div>`;
    
    // Start new row after Saturday
    if ((firstDay + day) % 7 === 0) {
      html += '</div><div class="row g-1">';
    }
  }
  
  html += '</div>';
  calendar.innerHTML = html;
}

// Update booking confirmation to use API
window.confirmBooking = async function() {
  if (!selectedDate) {
    alert('Please select a date');
    return;
  }
  
  const bookingData = {
    chefId: currentChef.id,
    date: selectedDate,
    startTime: document.getElementById('bookingTime').value,
    duration: parseInt(document.getElementById('bookingDuration').value),
    numberOfGuests: parseInt(document.getElementById('bookingGuests').value),
    address: {
      street: document.getElementById('bookingAddress').value.split(',')[0].trim(),
      city: document.getElementById('bookingAddress').value.split(',')[1].trim(),
      state: document.getElementById('bookingAddress').value.split(',')[2].trim(),
      zipCode: document.getElementById('bookingAddress').value.split(',')[3].trim(),
    },
    specialRequests: document.getElementById('bookingNotes').value,
  };
  
  try {
    showLoader();
    const response = await api.bookings.create(bookingData);
    
    alert('Booking created successfully! The chef will confirm shortly.');
    bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
    
    // Reset form
    document.getElementById('bookingForm').reset();
    selectedDate = null;
    
    // Refresh bookings if on bookings page
    if (document.getElementById('myBookingsPage')?.style.display === 'block') {
      showMyBookings();
    }
  } catch (error) {
    alert('Booking failed: ' + error.message);
  } finally {
    hideLoader();
  }
};

// Show user's bookings
async function showMyBookings() {
  try {
    showLoader();
    const response = await api.bookings.getMy();
    
    // Create and show bookings page
    displayMyBookings(response.data);
  } catch (error) {
    alert('Error loading bookings: ' + error.message);
  } finally {
    hideLoader();
  }
}

// Display user bookings
function displayMyBookings(bookings) {
  // You'll need to create a bookings page in your HTML
  // This is a simplified example
  const bookingsHtml = bookings.map(booking => `
    <div class="card mb-3">
      <div class="card-body">
        <h5>${booking.chef.user.firstName} ${booking.chef.user.lastName} - ${booking.chef.cuisineSpecialization}</h5>
        <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
        <p>Time: ${booking.startTime} (${booking.duration} hours)</p>
        <p>Status: <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></p>
        <p>Total: $${booking.totalPrice}</p>
        ${booking.status === 'completed' && !booking.rating ? 
          `<button class="btn btn-sm btn-primary" onclick="showReviewModal('${booking._id}')">Add Review</button>` : ''}
      </div>
    </div>
  `).join('');
  
  // Display in a modal or dedicated page
  alert('Bookings loaded! Check console for data.');
  console.log('My Bookings:', bookings);
}

// Contact form integration
function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const contactData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
      };
      
      try {
        showLoader();
        await api.contact.submit(contactData);
        alert('Thank you for your message! We will get back to you within 24 hours.');
        contactForm.reset();
      } catch (error) {
        alert('Error sending message: ' + error.message);
      } finally {
        hideLoader();
      }
    });
  }
}

// Chef Dashboard Functions
function showChefDashboard(chef, bookings = []) {
  document.getElementById('authTabs').style.display = 'none';
  document.getElementById('authTabContent').style.display = 'none';
  document.getElementById('chefDashboard').style.display = 'block';
  
  document.getElementById('chefName').textContent = appState.user.firstName;
  document.getElementById('dashboardCuisine').textContent = chef.cuisineSpecialization || chef.cuisine;
  document.getElementById('dashboardPrice').textContent = chef.hourlyRate || chef.price;
  document.getElementById('dashboardLocation').textContent = 
    chef.serviceLocation ? `${chef.serviceLocation.city}, ${chef.serviceLocation.state}` : chef.location;
  
  // Display bookings
  if (bookings.length > 0) {
    const bookingsHtml = bookings.map(booking => `
      <div class="mb-3 p-3 border rounded">
        <strong>${new Date(booking.date).toLocaleDateString()}</strong> - ${booking.startTime} - ${booking.duration} hours<br>
        <small class="text-muted">${booking.address.street}, ${booking.address.city}</small><br>
        <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span>
        ${booking.status === 'pending' ? `
          <div class="mt-2">
            <button class="btn btn-sm btn-success" onclick="updateBookingStatus('${booking._id}', 'confirmed')">Confirm</button>
            <button class="btn btn-sm btn-danger" onclick="updateBookingStatus('${booking._id}', 'cancelled')">Cancel</button>
          </div>
        ` : ''}
      </div>
    `).join('');
    
    document.getElementById('bookingsList').innerHTML = bookingsHtml;
  } else {
    document.getElementById('bookingsList').innerHTML = '<p class="text-muted">No bookings yet</p>';
  }
}

// Update booking status (for chefs)
async function updateBookingStatus(bookingId, status) {
  try {
    showLoader();
    await api.bookings.updateStatus(bookingId, status);
    alert(`Booking ${status}!`);
    
    // Reload bookings
    const bookings = await api.bookings.getMy();
    showChefDashboard(appState.user, bookings.data);
  } catch (error) {
    alert('Error updating booking: ' + error.message);
  } finally {
    hideLoader();
  }
}

// Helper functions
function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'danger',
  };
  return colors[status] || 'secondary';
}

function showLoader() {
  document.getElementById('loadingSpinner').classList.add('show');
}

function hideLoader() {
  document.getElementById('loadingSpinner').classList.remove('show');
}

// Update cuisine stats with real data
function updateCuisineStats(cuisines) {
  // Update the cuisine cards with real chef counts
  cuisines.forEach(cuisine => {
    const card = document.querySelector(`[onclick="showChefs('${cuisine.name}')"]`);
    if (card) {
      const small = card.querySelector('small');
      if (small) {
        small.textContent = `${cuisine.chefCount} Chefs Available`;
      }
    }
  });
}


