// --- Zentharo Professional Script.js ---
// Prevent browser from restoring scroll position on reload (do this as early as possible)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}


// Function to handle order submission and show popup
function handleOrder(event) {
    event.preventDefault(); // Prevent form submission
    const form = document.getElementById('orderForm');
    if (!form) return;
    const formData = new FormData(form);
    const customerDetails = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || ''
    };
    const checkboxes = document.getElementsByName('service');
    let selectedServices = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const h3 = checkbox.parentElement.querySelector('h3');
            selectedServices.push(h3 ? h3.textContent : 'Service');
        }
    });
    
    // Create request object with timestamp
    const now = new Date();
    const request = {
        customerDetails,
        selectedServices,
        status: 'Pending',
        submittedDate: now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        submittedDateTime: now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        // Also save as ISO string for accurate sorting
        submittedTimestamp: now.getTime()
    };
    
    // Save request to backend
    saveRequest(request);
    
    // Display popup with details
    const popupDetails = document.getElementById('popupDetails');
    if (popupDetails) {
        popupDetails.innerHTML = `
            <p><strong>Customer Name:</strong> ${customerDetails.name}</p>
            <p><strong>Email:</strong> ${customerDetails.email}</p>
            <p><strong>Phone:</strong> ${customerDetails.phone}</p>
            <p><strong>Selected Services:</strong></p>
            <ul>${selectedServices.map(service => `<li>${service}</li>`).join('')}</ul>
        `;
    }
    const orderPopup = document.getElementById('orderPopup');
    if (orderPopup) {
        orderPopup.style.display = 'block';
        animatePopup(); // Add animation for popup
        // Show success feedback animation
        const successMsg = document.createElement('div');
        successMsg.textContent = '✔ Proposal Requested Successfully!';
        successMsg.style.cssText = 'color:#2ecc71;font-weight:700;font-size:1.2rem;margin:1rem 0;opacity:0;transition:opacity 0.6s;';
        successMsg.setAttribute('id', 'successMsg');
        orderPopup.querySelector('.popup-content').insertBefore(successMsg, orderPopup.querySelector('.popup-content').children[1]);
        setTimeout(() => { successMsg.style.opacity = 1; }, 100);
        setTimeout(() => { successMsg.style.opacity = 0; }, 1800);
        setTimeout(() => { if (successMsg.parentNode) successMsg.parentNode.removeChild(successMsg); }, 2400);
        // Accessibility: focus the popup for keyboard users
        orderPopup.setAttribute('tabindex', '-1');
        orderPopup.focus();
        // Disable submit button while popup is open
        const submitBtn = form.querySelector('.order-button');
        if (submitBtn) submitBtn.disabled = true;
    }
    // Clear all fields and checkboxes after request
    form.reset();
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Function to save request to backend
async function saveRequest(request) {
    try {
        const response = await fetch('http://localhost:3000/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const savedRequest = await response.json();
        console.log('Request saved:', savedRequest);
    } catch (error) {
        console.error('Error saving request:', error);
        // Fallback to localStorage if API fails
        let requests = JSON.parse(localStorage.getItem('zentharoRequests')) || [];
        request.id = Date.now();
        requests.push(request);
        localStorage.setItem('zentharoRequests', JSON.stringify(requests));
        console.log('Request saved to localStorage as fallback');
    }
}

// Function to animate popup appearance
function animatePopup() {
    const popup = document.getElementById('orderPopup');
    if (!popup) return;
    popup.style.animation = 'scaleUp 0.5s ease-out';
    setTimeout(() => {
        popup.style.animation = '';
    }, 500);
}

// Function to handle request card statistics
function handleRequestCardStatistics() {
    // Create statistics container
    const statsContainer = document.createElement('div');
    statsContainer.className = 'request-stats';
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-value" id="total-requests">0</span>
            <span class="stat-label">Total Requests</span>
        </div>
        <div class="stat-item">
            <span class="stat-value" id="pending-requests">0</span>
            <span class="stat-label">Pending</span>
        </div>
        <div class="stat-item">
            <span class="stat-value" id="approved-requests">0</span>
            <span class="stat-label">Approved</span>
        </div>
        <div class="stat-item">
            <span class="stat-value" id="completed-requests">0</span>
            <span class="stat-label">Completed</span>
        </div>
    `;
    
    // Add statistics container to the page
    const requestsSection = document.querySelector('.request-approval-section');
    if (requestsSection) {
        requestsSection.insertBefore(statsContainer, requestsSection.firstChild.nextSibling);
    }
    
    // Update statistics
    updateRequestStatistics();
}

// Function to update request statistics
function updateRequestStatistics() {
    const requestCards = document.querySelectorAll('.request-card');
    const totalRequests = requestCards.length;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let completedRequests = 0;
    
    requestCards.forEach(card => {
        const statusElement = card.querySelector('.status');
        const status = statusElement.textContent.toLowerCase();
        
        switch (status) {
            case 'pending':
                pendingRequests++;
                break;
            case 'approved':
            // Mobile nav hamburger toggle
            document.addEventListener('DOMContentLoaded', function() {
                const hamburger = document.querySelector('.hamburger');
                const navLinks = document.querySelector('.nav-links');
                if (hamburger && navLinks) {
                    hamburger.addEventListener('click', function() {
                        navLinks.classList.toggle('active');
                    });
                }
            });
                approvedRequests++;
                break;
            case 'completed':
                completedRequests++;
                break;
        }
    });
    
    // Update statistics display
    document.getElementById('total-requests').textContent = totalRequests;
    document.getElementById('pending-requests').textContent = pendingRequests;
    document.getElementById('approved-requests').textContent = approvedRequests;
    document.getElementById('completed-requests').textContent = completedRequests;
}

// Function to handle request card progress tracking
function handleRequestCardProgressTracking() {
    // Add progress bar to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'request-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <span class="progress-text">0%</span>
        `;
        
        // Add progress container to card
        card.appendChild(progressContainer);
        
        // Set initial progress based on status
        const statusElement = card.querySelector('.status');
        const status = statusElement.textContent.toLowerCase();
        const progressFill = progressContainer.querySelector('.progress-fill');
        const progressText = progressContainer.querySelector('.progress-text');
        
        let progress = 0;
        switch (status) {
            case 'pending':
                progress = 25;
                break;
            case 'approved':
                progress = 75;
                break;
            case 'completed':
                progress = 100;
                break;
        }
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        
        // Add color based on progress
        if (progress < 50) {
            progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else if (progress < 100) {
            progressFill.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        }
    });
}

// Function to handle request card loading animations
function handleRequestCardLoadingAnimations() {
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach((card, index) => {
        // Add staggered fade-in animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

// Function to handle request card status animations
function handleRequestCardStatusAnimations() {
    const statusElements = document.querySelectorAll('.status');
    statusElements.forEach(status => {
        // Add pulse animation for pending status
        if (status.classList.contains('pending')) {
            status.style.animation = 'pulse 2s infinite';
        }
        
        // Add glow animation for approved status
        if (status.classList.contains('approved')) {
            status.style.animation = 'glow 2s infinite';
        }
        
        // Add spin animation for completed status
        if (status.classList.contains('completed')) {
            status.style.animation = 'spin 3s infinite';
        }
    });
}

// Function to handle request card animations
function handleRequestCardAnimations() {
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
        
        // Add click effect
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

// Function to handle request card search
function handleRequestCardSearch() {
    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'request-search';
    searchContainer.innerHTML = `
        <input type="text" class="search-input" placeholder="Search requests...">
    `;
    
    // Add search container to the page
    const requestsSection = document.querySelector('.request-approval-section');
    if (requestsSection) {
        requestsSection.insertBefore(searchContainer, requestsSection.firstChild.nextSibling);
    }
    
    // Add event listener to search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const requestCards = document.querySelectorAll('.request-card');
            
            requestCards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Function to handle request card sorting
function handleRequestCardSorting() {
    // Create sort dropdown
    const sortContainer = document.createElement('div');
    sortContainer.className = 'request-sort';
    sortContainer.innerHTML = `
        <select class="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
        </select>
    `;
    
    // Add sort container to the page
    const requestsSection = document.querySelector('.request-approval-section');
    if (requestsSection) {
        requestsSection.insertBefore(sortContainer, requestsSection.firstChild.nextSibling);
    }
    
    // Add event listener to sort select
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const requestsContainer = document.querySelector('.requests-container');
            const requestCards = Array.from(document.querySelectorAll('.request-card'));
            
            // Sort request cards based on selected option
            requestCards.sort((a, b) => {
                const dateA = new Date(a.querySelector('.request-details p:nth-child(2)').textContent.split(': ')[1]);
                const dateB = new Date(b.querySelector('.request-details p:nth-child(2)').textContent.split(': ')[1]);
                const statusA = a.querySelector('.status').textContent;
                const statusB = b.querySelector('.status').textContent;
                
                switch (sortValue) {
                    case 'newest':
                        return dateB - dateA;
                    case 'oldest':
                        return dateA - dateB;
                    case 'status':
                        // Sort by status priority: Pending, Approved, Completed
                        const statusPriority = {
                            'pending': 1,
                            'approved': 2,
                            'completed': 3
                        };
                        return statusPriority[statusA.toLowerCase()] - statusPriority[statusB.toLowerCase()];
                    default:
                        return 0;
                }
            });
            
            // Re-append sorted cards to container
            requestCards.forEach(card => {
                requestsContainer.appendChild(card);
            });
        });
    }
}

// Function to handle request card filtering
function handleRequestCardFiltering() {
    // Create filter buttons
    const filterContainer = document.createElement('div');
    filterContainer.className = 'request-filter';
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="pending">Pending</button>
        <button class="filter-btn" data-filter="approved">Approved</button>
        <button class="filter-btn" data-filter="completed">Completed</button>
    `;
    
    // Add filter container to the page
    const requestsSection = document.querySelector('.request-approval-section');
    if (requestsSection) {
        requestsSection.insertBefore(filterContainer, requestsSection.firstChild.nextSibling);
    }
    
    // Add event listeners to filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter request cards
            const requestCards = document.querySelectorAll('.request-card');
            requestCards.forEach(card => {
                const statusElement = card.querySelector('.status');
                const status = statusElement.textContent.toLowerCase();
                
                if (filterValue === 'all' || status === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Function to handle request card import
function handleRequestCardImport() {
    // Only show on Request Approval page
    if (!(location.pathname.includes('request-approval'))) {
        return;
    }
    // Create import button
    const importButton = document.createElement('button');
    importButton.className = 'import-btn';
    importButton.innerHTML = 'Import Requests';
    importButton.style.cssText = `
        position: fixed;
        bottom: 70px;
        right: 20px;
        background: rgba(52, 152, 219, 0.7);
        color: white;
        border: none;
        border-radius: 20px;
        padding: 10px 20px;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    // Add hover effect
    importButton.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(52, 152, 219, 1)';
        this.style.transform = 'scale(1.05)';
    });
    
    importButton.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(52, 152, 219, 0.7)';
        this.style.transform = 'scale(1)';
    });
    
    // Add click event to import requests
    importButton.addEventListener('click', function() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.style.display = 'none';
        
        // Add change event to handle file selection
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const csv = e.target.result;
                    const lines = csv.split('\n');
                    const headers = lines[0].split(',');
                    
                    // Process each line
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i];
                        if (line) {
                            const values = line.split('","');
                            const status = values[0].replace('"', '');
                            const date = values[1];
                            const time = values[2];
                            const customer = values[3];
                            const email = values[4];
                            const services = values[5].replace('"', '');
                            
                            // Create new request card
                            const requestCard = document.createElement('div');
                            requestCard.className = 'request-card';
                            
                            // Determine status class
                            let statusClass = 'pending';
                            if (status === 'Approved') statusClass = 'approved';
                            else if (status === 'Completed') statusClass = 'completed';
                            
                            requestCard.innerHTML = `
                                <div class="request-header">
                                    <h3>Project Request</h3>
                                    <span class="status ${statusClass}">${status}</span>
                                </div>
                                <div class="request-details">
                                    <p><strong>Submitted:</strong> Just now</p>
                                    <p><strong>Date:</strong> ${date}</p>
                                    <p><strong>Time:</strong> ${time}</p>
                                    <p><strong>Customer:</strong> ${customer}</p>
                                    <p><strong>Email:</strong> ${email}</p>
                                    <p><strong>Services:</strong> ${services}</p>
                                </div>
                                <div class="request-actions">
                                    <button class="view-details-btn">View Details</button>
                                </div>
                            `;
                            
                            // Add card to container
                            const requestsContainer = document.querySelector('.requests-container');
                            if (requestsContainer) {
                                requestsContainer.appendChild(requestCard);
                            }
                        }
                    }
                };
                reader.readAsText(file);
            }
        });
        
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
    
    // Add import button to the page
    document.body.appendChild(importButton);
}

// Function to handle request card export
function handleRequestCardExport() {
    // Only show on Request Approval page
    if (!(location.pathname.includes('request-approval'))) {
        return;
    }
    // Create export button
    const exportButton = document.createElement('button');
    exportButton.className = 'export-btn';
    exportButton.innerHTML = 'Export Requests';
    exportButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(46, 204, 113, 0.7);
        color: white;
        border: none;
        border-radius: 20px;
        padding: 10px 20px;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    // Add hover effect
    exportButton.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(46, 204, 113, 1)';
        this.style.transform = 'scale(1.05)';
    });
    
    exportButton.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(46, 204, 113, 0.7)';
        this.style.transform = 'scale(1)';
    });
    
    // Add click event to export requests
    exportButton.addEventListener('click', function() {
        // Get all request cards
        const requestCards = document.querySelectorAll('.request-card');
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Status,Submitted Date,Submitted Time,Customer,Email,Services\n";
        
        requestCards.forEach(card => {
            const status = card.querySelector('.status').textContent;
            const date = card.querySelector('.request-details p:nth-child(2)').textContent.split(': ')[1];
            const time = card.querySelector('.request-details p:nth-child(3)').textContent.split(': ')[1];
            const customer = card.querySelector('.request-details p:nth-child(4)').textContent.split(': ')[1];
            const email = card.querySelector('.request-details p:nth-child(5)').textContent.split(': ')[1];
            const services = card.querySelector('.request-details p:nth-child(6)').textContent.split(': ')[1];
            
            csvContent += `"${status}","${date}","${time}","${customer}","${email}","${services}"\n`;
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "requests.csv");
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Remove link
        document.body.removeChild(link);
    });
    
    // Add export button to the page
    document.body.appendChild(exportButton);
}

// Function to handle request card reminders
function handleRequestCardReminders() {
    // Check for pending requests and show reminders
    setInterval(() => {
        const pendingRequests = document.querySelectorAll('.status.pending');
        if (pendingRequests.length > 0) {
            // Show reminder notification
            if (typeof showNotification === 'function') {
                showNotification(`You have ${pendingRequests.length} pending request(s) that need attention.`, 'info');
            }
        }
    }, 300000); // Check every 5 minutes
}

// Function to handle request card notifications
function handleRequestCardNotifications() {
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    
    // Add notification container to the page
    document.body.appendChild(notificationContainer);
    
    // Function to show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;
        notification.style.cssText = `
            background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : type === 'error' ? 'rgba(231, 76, 60, 0.9)' : 'rgba(52, 152, 219, 0.9)'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        notificationContainer.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Add slide-out animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Expose showNotification function globally
    window.showNotification = showNotification;
}

// Function to handle request card archiving
function handleRequestCardArchiving() {
    // Add archive button to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create archive button
        const archiveButton = document.createElement('button');
        archiveButton.className = 'archive-btn';
        archiveButton.innerHTML = 'Archive';
        archiveButton.style.cssText = `
            background: rgba(149, 165, 166, 0.7);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 10px;
        `;
        
        // Add hover effect
        archiveButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(149, 165, 166, 1)';
            this.style.transform = 'scale(1.05)';
        });
        
        archiveButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(149, 165, 166, 0.7)';
            this.style.transform = 'scale(1)';
        });
        
        // Add click event to archive button
        archiveButton.addEventListener('click', function() {
            // Confirm archiving
            if (confirm('Are you sure you want to archive this request?')) {
                // Add archived class to card
                card.classList.add('archived');
                
                // Change button to unarchive
                archiveButton.innerHTML = 'Unarchive';
                archiveButton.style.background = 'rgba(155, 89, 182, 0.7)';
                
                // Update button click event
                archiveButton.onclick = function() {
                    // Confirm unarchiving
                    if (confirm('Are you sure you want to unarchive this request?')) {
                        // Remove archived class from card
                        card.classList.remove('archived');
                        
                        // Change button to archive
                        archiveButton.innerHTML = 'Archive';
                        archiveButton.style.background = 'rgba(149, 165, 166, 0.7)';
                        
                        // Update button click event
                        archiveButton.onclick = arguments.callee;
                        
                        if (typeof showNotification === 'function') {
                            showNotification('Request unarchived successfully!', 'success');
                        }
                    }
                };
                
                if (typeof showNotification === 'function') {
                    showNotification('Request archived successfully!', 'success');
                }
            }
        });
        
        // Add archive button to collaboration container
        const collaborationContainer = card.querySelector('.request-collaboration');
        if (collaborationContainer) {
            collaborationContainer.appendChild(archiveButton);
        } else {
            // Create collaboration container if it doesn't exist
            const collaborationContainer = document.createElement('div');
            collaborationContainer.className = 'request-collaboration';
            collaborationContainer.appendChild(archiveButton);
            card.appendChild(collaborationContainer);
        }
    });
}

// Function to handle request card notifications
function initNotificationPermissionButton() {
    // Add notification button to page
    const notificationButton = document.createElement('button');
    notificationButton.className = 'notification-btn';
    notificationButton.innerHTML = 'Enable Notifications';
    notificationButton.style.cssText = `
        background: rgba(155, 89, 182, 0.7);
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin: 20px auto;
        display: block;
    `;
    
    // Add hover effect
    notificationButton.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(155, 89, 182, 1)';
        this.style.transform = 'scale(1.05)';
    });
    
    notificationButton.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(155, 89, 182, 0.7)';
        this.style.transform = 'scale(1)';
    });
    
    // Add click event to notification button
    notificationButton.addEventListener('click', function() {
        // Check if notifications are supported
        if ('Notification' in window) {
            // Request permission for notifications
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    // Show notification
                    new Notification('Notifications Enabled', {
                        body: 'You will now receive notifications for new requests.',
                        icon: 'favicon.ico'
                    });
                    
                    if (typeof showNotification === 'function') {
                        showNotification('Notifications enabled successfully!', 'success');
                    }
                } else {
                    if (typeof showNotification === 'function') {
                        showNotification('Notifications permission denied.', 'error');
                    }
                }
            });
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Notifications not supported in this browser.', 'error');
            }
        }
    });
    
    // Add notification button to page
    const requestsContainer = document.querySelector('.requests-container');
    if (requestsContainer) {
        requestsContainer.parentNode.insertBefore(notificationButton, requestsContainer);
    }
}

// Function to handle request card import from CSV
function handleRequestCardImportFromCSV() {
    // Only show on Request Approval page
    if (!(location.pathname.includes('request-approval'))) {
        return;
    }
    // Add import button to page
    const importButton = document.createElement('button');
    importButton.className = 'import-btn';
    importButton.innerHTML = 'Import from CSV';
    importButton.style.cssText = `
        background: rgba(52, 152, 219, 0.7);
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin: 20px auto;
        display: block;
    `;
    
    // Add hover effect
    importButton.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(52, 152, 219, 1)';
        this.style.transform = 'scale(1.05)';
    });
    
    importButton.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(52, 152, 219, 0.7)';
        this.style.transform = 'scale(1)';
    });
    
    // Add click event to import button
    importButton.addEventListener('click', function() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.style.display = 'none';
        
        // Add change event to file input
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const csv = e.target.result;
                    const lines = csv.split('\n');
                    
                    // Remove header line
                    lines.shift();
                    
                    // Process each line
                    lines.forEach(line => {
                        if (line.trim() !== '') {
                            const values = line.split(',');
                            
                            // Create new request card
                            const newCard = document.createElement('div');
                            newCard.className = 'request-card';
                            newCard.innerHTML = `
                                <div class="request-header">
                                    <h3>${values[0]}</h3>
                                    <span class="status ${values[1].toLowerCase()}">${values[1]}</span>
                                </div>
                                <div class="request-details">
                                    <p><strong>Submitted:</strong> ${values[2]}</p>
                                    <p><strong>Customer:</strong> ${values[3]}</p>
                                    <p><strong>Email:</strong> ${values[4]}</p>
                                    <p><strong>Services:</strong> ${values[5]}</p>
                                </div>
                                <div class="request-actions">
                                    <button class="view-details-btn">View Details</button>
                                </div>
                            `;
                            
                            // Add collaboration container
                            const collaborationContainer = document.createElement('div');
                            collaborationContainer.className = 'request-collaboration';
                            newCard.appendChild(collaborationContainer);
                            
                            // Add progress bar
                            const progressContainer = document.createElement('div');
                            progressContainer.className = 'request-progress';
                            progressContainer.innerHTML = `
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 25%; background: linear-gradient(90deg, #f39c12, #e67e22);"></div>
                                </div>
                                <span class="progress-text">25%</span>
                            `;
                            newCard.appendChild(progressContainer);
                            
                            // Add status update container
                            const statusUpdateContainer = document.createElement('div');
                            statusUpdateContainer.className = 'status-update-container';
                            statusUpdateContainer.innerHTML = `
                                <button class="status-btn pending-btn">Set Pending</button>
                                <button class="status-btn approved-btn">Set Approved</button>
                                <button class="status-btn completed-btn">Set Completed</button>
                            `;
                            newCard.appendChild(statusUpdateContainer);
                            
                            // Add comment container
                            const commentContainer = document.createElement('div');
                            commentContainer.className = 'comment-container';
                            commentContainer.innerHTML = `
                                <div class="comments-list"></div>
                                <div class="add-comment">
                                    <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                                    <button class="comment-btn">Add Comment</button>
                                </div>
                            `;
                            newCard.appendChild(commentContainer);
                            
                            // Add new card to container
                            const requestsContainer = document.querySelector('.requests-container');
                            if (requestsContainer) {
                                requestsContainer.appendChild(newCard);
                                
                                // Add animations to new card
                                newCard.style.opacity = '0';
                                newCard.style.transform = 'translateY(20px)';
                                newCard.style.transition = 'all 0.5s ease';
                                
                                setTimeout(() => {
                                    newCard.style.opacity = '1';
                                    newCard.style.transform = 'translateY(0)';
                                }, 100);
                                
                                // Update statistics
                                updateRequestStatistics();
                            }
                        }
                    });
                    
                    if (typeof showNotification === 'function') {
                        showNotification('Requests imported from CSV successfully!', 'success');
                    }
                };
                reader.readAsText(file);
            }
        });
        
        // Add file input to page and click it
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
    
    // Add import button to page
    const requestsContainer = document.querySelector('.requests-container');
    if (requestsContainer) {
        requestsContainer.parentNode.insertBefore(importButton, requestsContainer);
    }
}

// Function to handle request card export to CSV
function handleRequestCardExportToCSV() {
    // Only show on Request Approval page
    if (!(location.pathname.includes('request-approval'))) {
        return;
    }
    // Add export button to page
    const exportButton = document.createElement('button');
    exportButton.className = 'export-btn';
    exportButton.innerHTML = 'Export to CSV';
    exportButton.style.cssText = `
        background: rgba(46, 204, 113, 0.7);
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin: 20px auto;
        display: block;
    `;
    
    // Add hover effect
    exportButton.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(46, 204, 113, 1)';
        this.style.transform = 'scale(1.05)';
    });
    
    exportButton.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(46, 204, 113, 0.7)';
        this.style.transform = 'scale(1)';
    });
    
    // Add click event to export button
    exportButton.addEventListener('click', function() {
        // Get all request cards
        const requestCards = document.querySelectorAll('.request-card');
        
        // Create CSV content
        let csvContent = 'ID,Status,Submitted Date,Customer Name,Email,Services\n';
        
        requestCards.forEach(card => {
            // Get request details
            const requestHeader = card.querySelector('.request-header h3').textContent;
            const requestStatus = card.querySelector('.status').textContent;
            const requestDetails = card.querySelector('.request-details').textContent;
            
            // Extract customer name, email and services from details
            const customerNameMatch = requestDetails.match(/Customer:\s*([^\n]+)/);
            const emailMatch = requestDetails.match(/Email:\s*([^\n]+)/);
            const servicesMatch = requestDetails.match(/Services:\s*([^\n]+)/);
            
            const customerName = customerNameMatch ? customerNameMatch[1].trim() : '';
            const email = emailMatch ? emailMatch[1].trim() : '';
            const services = servicesMatch ? servicesMatch[1].trim() : '';
            
            // Add to CSV
            csvContent += `"${requestHeader}","${requestStatus}","${new Date().toLocaleDateString()}","${customerName}","${email}","${services}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'requests.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        if (typeof showNotification === 'function') {
            showNotification('Requests exported to CSV successfully!', 'success');
        }
    });
    
    // Add export button to page
    const requestsContainer = document.querySelector('.requests-container');
    if (requestsContainer) {
        requestsContainer.parentNode.insertBefore(exportButton, requestsContainer);
    }
}

// Function to handle request card comments
function handleRequestCardComments() {
    // Add comment section to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create comment container
        const commentContainer = document.createElement('div');
        commentContainer.className = 'comment-container';
        commentContainer.innerHTML = `
            <div class="comments-list"></div>
            <div class="add-comment">
                <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                <button class="comment-btn">Add Comment</button>
            </div>
        `;
        
        // Add comment container to card
        card.appendChild(commentContainer);
        
        // Add click event to comment button
        const commentButton = commentContainer.querySelector('.comment-btn');
        commentButton.addEventListener('click', function() {
            const commentInput = commentContainer.querySelector('.comment-input');
            const commentText = commentInput.value.trim();
            
            if (commentText) {
                // Create new comment element
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-author">You</span>
                        <span class="comment-time">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div class="comment-text">${commentText}</div>
                `;
                
                // Add comment to list
                const commentsList = commentContainer.querySelector('.comments-list');
                commentsList.appendChild(commentElement);
                
                // Clear input
                commentInput.value = '';
                
                if (typeof showNotification === 'function') {
                    showNotification('Comment added successfully!', 'success');
                }
            }
        });
    });
}

// Function to handle request card status updates
function handleRequestCardStatusUpdates() {
    // Add status update buttons to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create status update container
        const statusUpdateContainer = document.createElement('div');
        statusUpdateContainer.className = 'status-update-container';
        statusUpdateContainer.innerHTML = `
            <button class="status-btn pending-btn">Set Pending</button>
            <button class="status-btn approved-btn">Set Approved</button>
            <button class="status-btn completed-btn">Set Completed</button>
        `;
        
        // Add status update container to card
        card.appendChild(statusUpdateContainer);
        
        // Add click events to status buttons
        const pendingButton = statusUpdateContainer.querySelector('.pending-btn');
        const approvedButton = statusUpdateContainer.querySelector('.approved-btn');
        const completedButton = statusUpdateContainer.querySelector('.completed-btn');
        
        pendingButton.addEventListener('click', function() {
            updateRequestStatus(card, 'pending');
        });
        
        approvedButton.addEventListener('click', function() {
            updateRequestStatus(card, 'approved');
        });
        
        completedButton.addEventListener('click', function() {
            updateRequestStatus(card, 'completed');
        });
    });
}

// Function to update request status
function updateRequestStatus(card, newStatus) {
    // Get status element
    const statusElement = card.querySelector('.status');
    
    // Update status text and class
    statusElement.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    statusElement.className = `status ${newStatus}`;
    
    // Update progress bar
    const progressFill = card.querySelector('.progress-fill');
    const progressText = card.querySelector('.progress-text');
    
    let progress = 0;
    switch (newStatus) {
        case 'pending':
            progress = 25;
            progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            break;
        case 'approved':
            progress = 75;
            progressFill.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
            break;
        case 'completed':
            progress = 100;
            progressFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
            break;
    }
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    
    // Update statistics
    updateRequestStatistics();
    
    if (typeof showNotification === 'function') {
        showNotification(`Request status updated to ${newStatus}!`, 'success');
    }
}

// Function to handle request card duplication
function handleRequestCardDuplication() {
    // Add duplicate button to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create duplicate button
        const duplicateButton = document.createElement('button');
        duplicateButton.className = 'duplicate-btn';
        duplicateButton.innerHTML = 'Duplicate';
        duplicateButton.style.cssText = `
            background: rgba(46, 204, 113, 0.7);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 10px;
        `;
        
        // Add hover effect
        duplicateButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(46, 204, 113, 1)';
            this.style.transform = 'scale(1.05)';
        });
        
        duplicateButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(46, 204, 113, 0.7)';
            this.style.transform = 'scale(1)';
        });
        
        // Add click event to duplicate button
        duplicateButton.addEventListener('click', function() {
            // Get request details
            const requestHeader = card.querySelector('.request-header h3').textContent;
            const requestStatus = card.querySelector('.status').textContent;
            const requestDetails = card.querySelector('.request-details').innerHTML;
            
            // Create new request card
            const newCard = document.createElement('div');
            newCard.className = 'request-card';
            newCard.innerHTML = `
                <div class="request-header">
                    <h3>${requestHeader} (Copy)</h3>
                    <span class="status pending">Pending</span>
                </div>
                <div class="request-details">
                    ${requestDetails}
                </div>
                <div class="request-actions">
                    <button class="view-details-btn">View Details</button>
                </div>
            `;
            
            // Add collaboration container
            const collaborationContainer = document.createElement('div');
            collaborationContainer.className = 'request-collaboration';
            newCard.appendChild(collaborationContainer);
            
            // Add progress bar
            const progressContainer = document.createElement('div');
            progressContainer.className = 'request-progress';
            progressContainer.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 25%; background: linear-gradient(90deg, #f39c12, #e67e22);"></div>
                </div>
                <span class="progress-text">25%</span>
            `;
            newCard.appendChild(progressContainer);
            
            // Add status update container
            const statusUpdateContainer = document.createElement('div');
            statusUpdateContainer.className = 'status-update-container';
            statusUpdateContainer.innerHTML = `
                <button class="status-btn pending-btn">Set Pending</button>
                <button class="status-btn approved-btn">Set Approved</button>
                <button class="status-btn completed-btn">Set Completed</button>
            `;
            newCard.appendChild(statusUpdateContainer);
            
            // Add new card to container
            const requestsContainer = document.querySelector('.requests-container');
            if (requestsContainer) {
                requestsContainer.insertBefore(newCard, requestsContainer.firstChild);
                
                // Add animations to new card
                newCard.style.opacity = '0';
                newCard.style.transform = 'translateY(20px)';
                newCard.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    newCard.style.opacity = '1';
                    newCard.style.transform = 'translateY(0)';
                }, 100);
                
                // Update statistics
                updateRequestStatistics();
                
                if (typeof showNotification === 'function') {
                    showNotification('Request duplicated successfully!', 'success');
                }
            }
        });
        
        // Add duplicate button to collaboration container
        const collaborationContainer = card.querySelector('.request-collaboration');
        if (collaborationContainer) {
            collaborationContainer.appendChild(duplicateButton);
        } else {
            // Create collaboration container if it doesn't exist
            const collaborationContainer = document.createElement('div');
            collaborationContainer.className = 'request-collaboration';
            collaborationContainer.appendChild(duplicateButton);
            card.appendChild(collaborationContainer);
        }
    });
}

// Function to handle request card deletion
function handleRequestCardDeletion() {
    // Add delete button to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = 'Delete';
        deleteButton.style.cssText = `
            background: rgba(231, 76, 60, 0.7);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 10px;
        `;
        
        // Add hover effect
        deleteButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(231, 76, 60, 1)';
            this.style.transform = 'scale(1.05)';
        });
        
        deleteButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(231, 76, 60, 0.7)';
            this.style.transform = 'scale(1)';
        });
        
        // Add click event to delete button
        deleteButton.addEventListener('click', function() {
            // Confirm deletion
            if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
                // Remove card from DOM
                card.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => {
                    card.remove();
                    
                    // Update statistics
                    updateRequestStatistics();
                    
                    if (typeof showNotification === 'function') {
                        showNotification('Request deleted successfully!', 'success');
                    }
                }, 500);
            }
        });
        
        // Add delete button to collaboration container
        const collaborationContainer = card.querySelector('.request-collaboration');
        if (collaborationContainer) {
            collaborationContainer.appendChild(deleteButton);
        } else {
            // Create collaboration container if it doesn't exist
            const collaborationContainer = document.createElement('div');
            collaborationContainer.className = 'request-collaboration';
            collaborationContainer.appendChild(deleteButton);
            card.appendChild(collaborationContainer);
        }
    });
}

// Function to handle request card printing
function handleRequestCardPrinting() {
    // Add print button to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create print button
        const printButton = document.createElement('button');
        printButton.className = 'print-btn';
        printButton.innerHTML = 'Print';
        printButton.style.cssText = `
            background: rgba(231, 76, 60, 0.7);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 10px;
        `;
        
        // Add hover effect
        printButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(231, 76, 60, 1)';
            this.style.transform = 'scale(1.05)';
        });
        
        printButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(231, 76, 60, 0.7)';
            this.style.transform = 'scale(1)';
        });
        
        // Add click event to print button
        printButton.addEventListener('click', function() {
            // Create print window
            const printWindow = window.open('', '_blank');
            const requestHeader = card.querySelector('.request-header h3').textContent;
            const requestStatus = card.querySelector('.status').textContent;
            const requestDetails = card.querySelector('.request-details').innerHTML;
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Request Details</title>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            .request-card {
                                border: 1px solid #ccc;
                                padding: 20px;
                                margin: 20px;
                                border-radius: 5px;
                            }
                            .request-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 15px;
                            }
                            .status {
                                padding: 5px 10px;
                                border-radius: 15px;
                                color: white;
                            }
                            .status.pending { background-color: #f39c12; }
                            .status.approved { background-color: #2ecc71; }
                            .status.completed { background-color: #3498db; }
                        </style>
                    </head>
                    <body>
                        <div class="request-card">
                            <div class="request-header">
                                <h3>${requestHeader}</h3>
                                <span class="status ${requestStatus.toLowerCase()}">${requestStatus}</span>
                            </div>
                            <div class="request-details">
                                ${requestDetails}
                            </div>
                        </div>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.print();
        });
        
        // Add print button to collaboration container
        const collaborationContainer = card.querySelector('.request-collaboration');
        if (collaborationContainer) {
            collaborationContainer.appendChild(printButton);
        } else {
            // Create collaboration container if it doesn't exist
            const collaborationContainer = document.createElement('div');
            collaborationContainer.className = 'request-collaboration';
            collaborationContainer.appendChild(printButton);
            card.appendChild(collaborationContainer);
        }
    });
}

// Function to handle request card sharing
function handleRequestCardSharing() {
    // Add share button to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create share button
        const shareButton = document.createElement('button');
        shareButton.className = 'share-btn';
        shareButton.innerHTML = 'Share';
        shareButton.style.cssText = `
            background: rgba(155, 89, 182, 0.7);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 10px;
        `;
        
        // Add hover effect
        shareButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(155, 89, 182, 1)';
            this.style.transform = 'scale(1.05)';
        });
        
        shareButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(155, 89, 182, 0.7)';
            this.style.transform = 'scale(1)';
        });
        
        // Add click event to share button
        shareButton.addEventListener('click', function() {
            // Get request details
            const requestHeader = card.querySelector('.request-header h3').textContent;
            const requestStatus = card.querySelector('.status').textContent;
            const requestDetails = card.querySelector('.request-details').textContent;
            
            // Create shareable content
            const shareableContent = `
                Request: ${requestHeader}
                Status: ${requestStatus}
                Details: ${requestDetails}
            `;
            
            // Check if Web Share API is available
            if (navigator.share) {
                navigator.share({
                    title: 'Request Details',
                    text: shareableContent,
                    url: window.location.href
                }).catch(console.error);
            } else {
                // Fallback to copying to clipboard
                const textArea = document.createElement('textarea');
                textArea.value = shareableContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (typeof showNotification === 'function') {
                    showNotification('Request details copied to clipboard!', 'success');
                }
            }
        });
        
        // Add share button to collaboration container
        const collaborationContainer = card.querySelector('.request-collaboration');
        if (collaborationContainer) {
            collaborationContainer.appendChild(shareButton);
        } else {
            // Create collaboration container if it doesn't exist
            const collaborationContainer = document.createElement('div');
            collaborationContainer.className = 'request-collaboration';
            collaborationContainer.appendChild(shareButton);
            card.appendChild(collaborationContainer);
        }
    });
}

// Function to handle request card collaboration
function handleRequestCardCollaboration() {
    // Add collaboration button to each request card
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        // Create collaboration container
        const collaborationContainer = document.createElement('div');
        collaborationContainer.className = 'request-collaboration';
        collaborationContainer.innerHTML = `
            <button class="collaborate-btn">Collaborate</button>
            <div class="collaborators-list"></div>
        `;
        
        // Add collaboration container to card
        card.appendChild(collaborationContainer);
        
        // Add click event to collaborate button
        const collaborateButton = collaborationContainer.querySelector('.collaborate-btn');
        collaborateButton.addEventListener('click', function() {
            // Get request ID (in a real implementation, this would be from the request data)
            const requestId = Math.random().toString(36).substr(2, 9);
            
            // Show collaboration modal
            showCollaborationModal(requestId, card);
        });
    });
}

// Function to show collaboration modal
function showCollaborationModal(requestId, card) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'collaboration-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Collaborate on Request</h2>
            <p>Request ID: ${requestId}</p>
            <div class="collaborator-form">
                <input type="email" class="collaborator-email" placeholder="Enter collaborator's email">
                <button class="add-collaborator-btn">Add Collaborator</button>
            </div>
            <div class="current-collaborators">
                <h3>Current Collaborators</h3>
                <ul class="collaborators-list">
                    <li>You (Owner)</li>
                </ul>
            </div>
            <button class="save-collaborators-btn">Save</button>
        </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Add close event
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Add add collaborator event
    const addCollaboratorBtn = modal.querySelector('.add-collaborator-btn');
    addCollaboratorBtn.addEventListener('click', function() {
        const emailInput = modal.querySelector('.collaborator-email');
        const email = emailInput.value;
        
        if (email) {
            // Add collaborator to list
            const collaboratorsList = modal.querySelector('.collaborators-list');
            const listItem = document.createElement('li');
            listItem.textContent = email;
            collaboratorsList.appendChild(listItem);
            
            // Clear input
            emailInput.value = '';
        }
    });
    
    // Add save event
    const saveBtn = modal.querySelector('.save-collaborators-btn');
    saveBtn.addEventListener('click', function() {
        // In a real implementation, you would save the collaborators to the server
        if (typeof showNotification === 'function') {
            showNotification('Collaborators saved successfully!', 'success');
        }
        document.body.removeChild(modal);
    });
}

// Function to handle view details button clicks
function handleViewDetailsButtonClick() {
    // This function can be expanded to show more details about a request
    // For now, we'll just add a simple event listener
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-details-btn')) {
            // Find the parent request card
            const requestCard = e.target.closest('.request-card');
            if (requestCard) {
                // Get the request details from the card
                const requestHeader = requestCard.querySelector('.request-header h3').textContent;
                const requestStatus = requestCard.querySelector('.status').textContent;
                const requestDetails = requestCard.querySelector('.request-details').innerHTML;
                
                // For now, just log to console
                console.log('Viewing details for:', requestHeader, requestStatus);
                console.log('Details:', requestDetails);
                
                // In a real implementation, you might show a modal with more details
                alert('Viewing details for: ' + requestHeader + ' (' + requestStatus + ')');
            }
        }
    });
}

// Function to handle modern scroll behavior
function handleModernScroll() {
    const scrollContainer = document.querySelector('.requests-scroll-container');
    if (scrollContainer) {
        // Add smooth scrolling behavior
        scrollContainer.style.scrollBehavior = 'smooth';
        
        // Add scroll shadow effect
        scrollContainer.addEventListener('scroll', function() {
            const scrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            
            // Add shadow when scrolling
            if (scrollTop > 0) {
                scrollContainer.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.2)';
            } else {
                scrollContainer.style.boxShadow = 'inset 0 0 10px rgba(0, 0, 0, 0.1)';
            }
            
            // Add fade effect at the bottom when not at the end
            if (scrollTop < scrollHeight - 10) {
                scrollContainer.style.background = 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 90%, rgba(255, 255, 255, 0) 100%)';
            } else {
                scrollContainer.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
        
        // Add scroll indicator
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = '↓';
        scrollIndicator.style.cssText = `
            position: absolute;
            right: 10px;
            top: 10px;
            background: rgba(46, 204, 113, 0.7);
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            opacity: 0.7;
            transition: opacity 0.3s;
        `;
        scrollContainer.appendChild(scrollIndicator);
        
        // Hide scroll indicator when at top
        scrollContainer.addEventListener('scroll', function() {
            if (this.scrollTop > 50) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '0.7';
            }
        });
    }
}

// Function to format date/time for display
function formatDateTime(dateTime) {
    // Format date
    const formattedDate = dateTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format time
    const formattedTime = dateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Format relative time (e.g., "2 hours ago")
    const now = new Date();
    const diffMs = now - dateTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let relativeTime;
    if (diffMins < 1) {
        relativeTime = 'Just now';
    } else if (diffMins < 60) {
        relativeTime = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        relativeTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
        relativeTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    return {
        date: formattedDate,
        time: formattedTime,
        relative: relativeTime
    };
}

// Function to update request card timestamps
function updateRequestCardTimestamps() {
    // Update timestamps every minute
    setInterval(() => {
        const timestampElements = document.querySelectorAll('.request-details p:first-child');
        timestampElements.forEach(element => {
            // Get the original timestamp from data attribute or text content
            const originalText = element.textContent;
            if (originalText.includes('Submitted:')) {
                // Extract the date/time from the element
                const dateTimeText = element.nextElementSibling.textContent.split(': ')[1];
                const dateTime = new Date(dateTimeText);
                
                // Format the updated relative time
                const formattedDateTime = formatDateTime(dateTime);
                
                // Update the element with the new relative time
                element.innerHTML = `<strong>Submitted:</strong> ${formattedDateTime.relative}`;
            }
        });
    }, 60000); // Update every minute
}

// Function to load and display requests on the request approval page
async function loadRequests() {
    // Check if we're on the request approval page
    if (window.location.pathname.includes('request-approval.html') ||
        window.location.pathname.endsWith('request-approval')) {
        
        const requestsContainer = document.querySelector('.requests-container');
        if (!requestsContainer) return;
        
        try {
            // Fetch requests from backend
            const response = await fetch('http://localhost:3000/api/requests');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const requests = await response.json();
            
            // Clear existing content
            requestsContainer.innerHTML = '';
            
            // Display message if no requests
            if (requests.length === 0) {
                requestsContainer.innerHTML = `
                    <div class="no-requests-message">
                        <h3>No requests found</h3>
                        <p>You haven't submitted any requests yet. <a href="index.html#start-project">Submit a request</a> to get started.</p>
                    </div>
                `;
                return;
            }
            
            // Sort requests by submitted date/time (newest first)
            requests.sort((a, b) => {
                // Use submittedTimestamp if available, otherwise parse date strings
                const timestampA = a.submittedTimestamp || (a.submittedDateTime ? new Date(a.submittedDateTime).getTime() : new Date(a.submittedDate).getTime());
                const timestampB = b.submittedTimestamp || (b.submittedDateTime ? new Date(b.submittedDateTime).getTime() : new Date(b.submittedDate).getTime());
                return timestampB - timestampA; // Descending order (newest first)
            });
            
            // Display requests
            requests.forEach(request => {
                const requestCard = document.createElement('div');
                requestCard.className = 'request-card';
                
                // Determine status class
                let statusClass = 'pending';
                if (request.status === 'Approved') statusClass = 'approved';
                else if (request.status === 'Completed') statusClass = 'completed';
                
                // Format the date/time for display
                let dateTime;
                
                // Try to get the date/time from submittedTimestamp first, then submittedDateTime, then submittedDate
                if (request.submittedTimestamp) {
                    dateTime = new Date(request.submittedTimestamp);
                } else if (request.submittedDateTime) {
                    dateTime = new Date(request.submittedDateTime);
                } else {
                    dateTime = new Date(request.submittedDate);
                }
                
                const formattedDateTime = formatDateTime(dateTime);
                
                requestCard.innerHTML = `
                    <div class="request-header">
                        <h3>Project Request</h3>
                        <span class="status ${statusClass}">${request.status}</span>
                    </div>
                    <div class="request-details">
                        <p><strong>Submitted:</strong> ${formattedDateTime.relative}</p>
                        <p><strong>Date:</strong> ${formattedDateTime.date}</p>
                        <p><strong>Time:</strong> ${formattedDateTime.time}</p>
                        <p><strong>Customer:</strong> ${request.customerDetails.name}</p>
                        <p><strong>Email:</strong> ${request.customerDetails.email}</p>
                        <p><strong>Services:</strong> ${request.selectedServices.join(', ')}</p>
                    </div>
                    <div class="request-actions">
                        <button class="view-details-btn">View Details</button>
                    </div>
                `;
                
                requestsContainer.appendChild(requestCard);
            });
        } catch (error) {
            console.error('Error loading requests:', error);
            // Fallback to localStorage if API fails
            const requests = JSON.parse(localStorage.getItem('zentharoRequests')) || [];
            
            // Clear existing content
            requestsContainer.innerHTML = '';
            
            // Display message if no requests
            if (requests.length === 0) {
                requestsContainer.innerHTML = `
                    <div class="no-requests-message">
                        <h3>No requests found</h3>
                        <p>You haven't submitted any requests yet. <a href="index.html#start-project">Submit a request</a> to get started.</p>
                    </div>
                `;
                return;
            }
            
            // Sort requests by submitted date/time (newest first)
            requests.sort((a, b) => {
                // Use submittedTimestamp if available, otherwise parse date strings
                const timestampA = a.submittedTimestamp || (a.submittedDateTime ? new Date(a.submittedDateTime).getTime() : new Date(a.submittedDate).getTime());
                const timestampB = b.submittedTimestamp || (b.submittedDateTime ? new Date(b.submittedDateTime).getTime() : new Date(b.submittedDate).getTime());
                return timestampB - timestampA; // Descending order (newest first)
            });
            
            // Display requests from localStorage
            requests.forEach(request => {
                const requestCard = document.createElement('div');
                requestCard.className = 'request-card';
                
                // Determine status class
                let statusClass = 'pending';
                if (request.status === 'Approved') statusClass = 'approved';
                else if (request.status === 'Completed') statusClass = 'completed';
                
                // Format the date/time for display
                let dateTime;
                
                // Try to get the date/time from submittedTimestamp first, then submittedDateTime, then submittedDate
                if (request.submittedTimestamp) {
                    dateTime = new Date(request.submittedTimestamp);
                } else if (request.submittedDateTime) {
                    dateTime = new Date(request.submittedDateTime);
                } else {
                    dateTime = new Date(request.submittedDate);
                }
                
                const formattedDateTime = formatDateTime(dateTime);
                
                requestCard.innerHTML = `
                    <div class="request-header">
                        <h3>Project Request</h3>
                        <span class="status ${statusClass}">${request.status}</span>
                    </div>
                    <div class="request-details">
                        <p><strong>Submitted:</strong> ${formattedDateTime.relative}</p>
                        <p><strong>Date:</strong> ${formattedDateTime.date}</p>
                        <p><strong>Time:</strong> ${formattedDateTime.time}</p>
                        <p><strong>Customer:</strong> ${request.customerDetails.name}</p>
                        <p><strong>Email:</strong> ${request.customerDetails.email}</p>
                        <p><strong>Services:</strong> ${request.selectedServices.join(', ')}</p>
                    </div>
                    <div class="request-actions">
                        <button class="view-details-btn">View Details</button>
                    </div>
                `;
                
                requestsContainer.appendChild(requestCard);
            });
        }
    }
}

// Load requests when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadRequests();
});

// Function to close the popup
function closePopup() {
    const popup = document.getElementById('orderPopup');
    if (!popup) return;
    const popupContent = popup.querySelector('.popup-content');
    if (popupContent) {
        popupContent.classList.add('fadeOut');
    }
    setTimeout(() => {
        popup.style.display = 'none';
        if (popupContent) {
            popupContent.classList.remove('fadeOut');
        }
        // Re-enable the submit button for next use
        const form = document.getElementById('orderForm');
        if (form) {
            const submitBtn = form.querySelector('.order-button');
            if (submitBtn) submitBtn.disabled = false;
        }
    }, 600);
}

// Function to close the contact popup
function closeContactPopup() {
    const popup = document.getElementById('contactPopup');
    if (!popup) return;
    const popupContent = popup.querySelector('.popup-content');
    if (popupContent) {
        popupContent.classList.add('fadeOut');
    }
    setTimeout(() => {
        popup.style.display = 'none';
        if (popupContent) {
            popupContent.classList.remove('fadeOut');
        }
        // Re-enable the submit button for next use
        const form = document.querySelector('.contact-form');
        if (form) {
            const submitBtn = form.querySelector('.order-button');
            if (submitBtn) submitBtn.disabled = false;
        }
    }, 600);
}

// Function to handle contact form submission
function handleContactSubmit(event) {
    event.preventDefault(); // Prevent form submission
    const form = event.target;
    const formData = new FormData(form);
    const customerDetails = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        message: formData.get('message') || ''
    };
    
    // Show the contact popup
    const contactPopup = document.getElementById('contactPopup');
    if (contactPopup) {
        contactPopup.style.display = 'block';
        animateContactPopup(); // Add animation for popup
        // Show success feedback animation
        const successMsg = document.createElement('div');
        successMsg.textContent = '✔ Message Sent Successfully!';
        successMsg.style.cssText = 'color:#2ecc71;font-weight:700;font-size:1.2rem;margin:1rem 0;opacity:0;transition:opacity 0.6s;';
        successMsg.setAttribute('id', 'contactSuccessMsg');
        contactPopup.querySelector('.popup-content').insertBefore(successMsg, contactPopup.querySelector('.popup-content').children[1]);
        setTimeout(() => { successMsg.style.opacity = 1; }, 100);
        setTimeout(() => { successMsg.style.opacity = 0; }, 1800);
        setTimeout(() => { if (successMsg.parentNode) successMsg.parentNode.removeChild(successMsg); }, 2400);
        // Accessibility: focus the popup for keyboard users
        contactPopup.setAttribute('tabindex', '-1');
        contactPopup.focus();
        // Disable submit button while popup is open
        const submitBtn = form.querySelector('.order-button');
        if (submitBtn) submitBtn.disabled = true;
    }
    
    // Clear all fields after submission
    form.reset();
}

// Function to animate contact popup appearance
function animateContactPopup() {
    const popup = document.getElementById('contactPopup');
    if (!popup) return;
    popup.style.animation = 'scaleUp 0.5s ease-out';
    setTimeout(() => {
        popup.style.animation = '';
    }, 500);
}

// Hamburger menu toggle for mobile
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
            animateNav(); // Add animation for nav toggle
        }
    });
}

// Function to animate navigation toggle
function animateNav() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    if (navLinks.classList.contains('active')) {
        navLinks.style.animation = 'slideDown 0.5s ease-out';
    } else {
        navLinks.style.animation = 'slideUp 0.5s ease-out';
    }
    setTimeout(() => {
        navLinks.style.animation = '';
    }, 500);
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        animateScroll(); // Add animation for smooth scroll
    }
}

// Function to animate smooth scroll
function animateScroll() {
    const target = document.querySelector('main');
    if (!target) return;
    target.style.animation = 'slideUp 0.8s ease-out';
    setTimeout(() => {
        target.style.animation = '';
    }, 800);
}

// Add particle animation for background (optional, for advanced effect)
document.addEventListener('DOMContentLoaded', () => {
    // Always start at the top of the page on refresh (but not on anchor navigation)
    if (!window.location.hash) {
        setTimeout(() => window.scrollTo(0, 0), 1);
    }
    createParticles();
    // Entrance animation for header and main on refresh (only if not already running)
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (header && !header.classList.contains('slide-down-entrance')) {
        header.classList.add('slide-down-entrance');
        setTimeout(() => header.classList.remove('slide-down-entrance'), 900);
    }
    if (main && !main.classList.contains('slide-down-entrance')) {
        main.classList.add('slide-down-entrance');
        setTimeout(() => main.classList.remove('slide-down-entrance'), 900);
    }
});

function createParticles() {
    // Reduce particle count on mobile devices for performance
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 20 : 50;
    
    const particleContainer = document.createElement('div');
    particleContainer.classList.add('particles');
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particleContainer.appendChild(particle);
    }
    
    // Add resize listener to adjust particles on window resize
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        const newParticleCount = isMobile ? 20 : 50;
        
        // Remove excess particles if needed
        while (particleContainer.children.length > newParticleCount) {
            particleContainer.removeChild(particleContainer.lastChild);
        }
        
        // Add particles if needed
        while (particleContainer.children.length < newParticleCount) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particleContainer.appendChild(particle);
        }
    });
}

// Function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to validate password strength
function validatePassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
}

// Function to add form error animation
function addFormErrorAnimation(input) {
    if (input) {
        // Add shake animation
        input.style.animation = 'shake 0.5s';
        
        // Remove animation after it completes
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
}

// Function to add form submission animation
function addFormSubmissionAnimation(form) {
    if (form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            // Store original text
            const originalText = submitButton.innerHTML;
            
            // Add loading animation
            form.addEventListener('submit', function() {
                submitButton.innerHTML = 'Loading...';
                submitButton.disabled = true;
                submitButton.style.opacity = '0.7';
                
                // Restore button state after 3 seconds if no response
                setTimeout(() => {
                    if (submitButton.disabled) {
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                        submitButton.style.opacity = '1';
                    }
                }, 3000);
            });
        }
    }
}

// Function to add form reset animation
function addFormResetAnimation(form) {
    if (form) {
        const resetButton = form.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                // Add visual feedback
                this.innerHTML = 'Resetting...';
                this.style.opacity = '0.7';
                
                // Reset form
                form.reset();
                
                // Restore button state after 1 second
                setTimeout(() => {
                    this.innerHTML = 'Reset';
                    this.style.opacity = '1';
                }, 1000);
            });
        }
    }
}

// Function to handle login form submission
function handleLoginFormSubmission() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Add form submission animation
        addFormSubmissionAnimation(loginForm);
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            // Validate email format
            if (!validateEmail(credentials.email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Validate password length
            if (credentials.password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.name);
                
                // Redirect to request approval page
                window.location.href = 'request-approval.html';
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please check your credentials and try again.');
                
                // Restore button state on error
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.innerHTML = 'Login';
                }
            }
        });
    }
}

// Function to add form focus animations
function addFormFocusAnimations() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        // Add focus animation
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.5)';
            this.style.transition = 'all 0.3s ease';
        });
        
        // Remove focus animation
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '';
        });
    });
}

// Function to add real-time validation to form inputs
function addRealTimeValidation() {
    // Add validation to email inputs
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#e74c3c';
                this.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.5)';
            } else {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });
    
    // Add validation to password inputs
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.name === 'password' || this.name === 'newPassword') {
                if (this.value && !validatePassword(this.value)) {
                    this.style.borderColor = '#e74c3c';
                    this.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.5)';
                } else {
                    this.style.borderColor = '';
                    this.style.boxShadow = '';
                }
            }
        });
    });
    
    // Add validation to name inputs
    const nameInputs = document.querySelectorAll('input[name="name"]');
    nameInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && this.value.length < 2) {
                this.style.borderColor = '#e74c3c';
                this.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.5)';
            } else {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });
}

// Function to handle registration form submission
function handleRegistrationFormSubmission() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Add form submission animation
        addFormSubmissionAnimation(registerForm);
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };
            
            // Validate name
            if (!userData.name || userData.name.length < 2) {
                alert('Please enter a valid name (at least 2 characters).');
                return;
            }
            
            // Validate email format
            if (!validateEmail(userData.email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Validate password strength
            if (!validatePassword(userData.password)) {
                alert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.');
                return;
            }
            
            // Check if passwords match
            if (userData.password !== userData.confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: userData.name,
                        email: userData.email,
                        password: userData.password
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.name);
                
                // Redirect to request approval page
                window.location.href = 'request-approval.html';
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
                
                // Restore button state on error
                const submitButton = registerForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.innerHTML = 'Register';
                }
            }
        });
    }
}

// Function to handle name change form submission
function handleNameChangeFormSubmission() {
    const nameForm = document.getElementById('nameForm');
    if (nameForm) {
        // Add form submission animation
        addFormSubmissionAnimation(nameForm);
        
        nameForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const newName = formData.get('name');
            const token = localStorage.getItem('authToken');
            
            // Validate name
            if (!newName || newName.length < 2) {
                alert('Please enter a valid name (at least 2 characters).');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/user/name', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: newName })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Update name in localStorage
                localStorage.setItem('userName', data.name);
                
                alert('Name updated successfully!');
                
                // Restore button state on success
                const submitButton = nameForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.innerHTML = 'Update Name';
                }
            } catch (error) {
                console.error('Name update error:', error);
                alert('Failed to update name. Please try again.');
                
                // Restore button state on error
                const submitButton = nameForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.innerHTML = 'Update Name';
                }
            }
        });
    }
}

// Function to handle password change form submission
function handlePasswordChangeFormSubmission() {
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        // Add form submission animation
        addFormSubmissionAnimation(passwordForm);
        
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');
            const token = localStorage.getItem('authToken');
            
            // Validate current password length
            if (currentPassword.length < 6) {
                alert('Current password must be at least 6 characters long.');
                return;
            }
            
            // Validate new password strength
            if (!validatePassword(newPassword)) {
                alert('New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.');
                return;
            }
            
            // Check if new passwords match
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match. Please try again.');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/user/password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                alert('Password updated successfully!');
                
                // Reset form
                this.reset();
                
                // Restore button state on success
                const submitButton = passwordForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.innerHTML = 'Change Password';
                }
            } catch (error) {
                console.error('Password update error:', error);
                alert('Failed to update password. Please try again.');
                
                // Restore button state on error
                const submitButton = passwordForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.innerHTML = 'Change Password';
                }
            }
        });
    }
}

// Function to handle logout
function handleLogout() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            window.location.href = 'login.html';
        });
    }
}

// Function to check if user is authenticated
function checkUserAuthentication() {
    // List of pages that require authentication
    const protectedPages = ['request-approval.html', 'profile.html'];
    
    // Check if current page requires authentication
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
        }
    }
}

// Function to update user info display
function updateUserInfoDisplay() {
    const userInfoDisplay = document.querySelector('.user-info-display');
    if (!userInfoDisplay) return;
    
    // Don't show user info on main index page
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        userInfoDisplay.classList.remove('show');
        return;
    }
    
    const userName = localStorage.getItem('userName');
    if (userName) {
        userInfoDisplay.textContent = userName;
        userInfoDisplay.classList.add('show');
    } else {
        userInfoDisplay.classList.remove('show');
    }
}

// Call updateUserInfoDisplay on page load
document.addEventListener('DOMContentLoaded', function() {
    checkUserAuthentication();
    handleLoginFormSubmission();
    handleRegistrationFormSubmission();
    handleNameChangeFormSubmission();
    handlePasswordChangeFormSubmission();
    handleLogout();
    handleViewDetailsButtonClick();
    handleRequestCardAnimations();
    handleRequestCardLoadingAnimations();
    handleRequestCardStatusAnimations();
    handleRequestCardFiltering();
    handleRequestCardSearch();
    handleRequestCardSorting();
    handleRequestCardExport();
    handleRequestCardImport();
    handleRequestCardStatistics();
    handleRequestCardNotifications();
    handleRequestCardReminders();
    handleRequestCardProgressTracking();
    handleRequestCardCollaboration();
    handleRequestCardArchiving();
    handleRequestCardSharing();
    handleRequestCardPrinting();
    handleRequestCardDeletion();
    handleRequestCardDuplication();
    handleRequestCardStatusUpdates();
    handleRequestCardComments();
    handleRequestCardExportToCSV();
    handleRequestCardImportFromCSV();
    handleModernScroll();
    handleFloatingActionButton();
    addRealTimeValidation();
    addFormFocusAnimations();
    addFormResetAnimation(document.getElementById('nameForm'));
    addFormResetAnimation(document.getElementById('passwordForm'));
    updateUserInfoDisplay();
    loadRequests();
    updateRequestCardTimestamps();
    
    // Update statistics when requests are loaded
    setTimeout(updateRequestStatistics, 1000);
});

// Update user info display on storage changes (for cross-tab updates)
window.addEventListener('storage', function(e) {
    if (e.key === 'userName') {
        updateUserInfoDisplay();
    }
});

// Function to handle floating action button
function handleFloatingActionButton() {
    const floatingBtn = document.querySelector('.floating-cta');
    if (floatingBtn) {
        // Add hover effect
        floatingBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-4px)';
        });
        
        floatingBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
        
        // Add click effect
        floatingBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    }
}

window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const currentScroll = window.pageYOffset;
    if (nav && header) {
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
            header.classList.add('small');
            header.classList.add('hidden-content');
        } else {
            nav.classList.remove('scrolled');
            header.classList.remove('small');
            header.classList.remove('hidden-content');
        }
    }
});
