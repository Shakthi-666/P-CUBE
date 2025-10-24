
// ======================================================================
// CORE APP DATA & LOGIC
// Data is stored in localStorage to simulate user persistence.
// ======================================================================

let totalStreaks = 0;
let currentUser = null; 

// Array to hold the global feed. Loaded/Saved using localStorage.
let sharedItems = []; 

// --- STATE MANAGEMENT ---

function saveSharedItems() {
    localStorage.setItem('sharedItems', JSON.stringify(sharedItems));
}

function loadSharedItems() {
    const items = JSON.parse(localStorage.getItem('sharedItems'));
    if (items && items.length > 0) {
        sharedItems = items;
    } else {
        // Initialize with mock data if localStorage is empty
        sharedItems = [
            { id: 1, type: 'Food', itemName: 'Surplus Dosa Batter', listingType: 'Quarter Price', discountType: 'Quarter Price', user: 'FoodieGuru', contact: '+91 999 12345', price: '₹40' },
            { id: 2, type: 'Product', itemName: 'Old Study Lamp', listingType: 'For Free', discountType: '', user: 'EcoSamaritan', contact: '+91 888 67890', price: 'FREE' },
        ]; 
        saveSharedItems();
    }
}

function saveUserState(user) {
    // Only save essential user details. Using localStorage simulates a backend.
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
    totalStreaks = user.streaks || 0;
    updateProfileUI();
}

function loadUserState() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        saveUserState(user); // Load and set current user/streaks
        return true;
    }
    return false;
}

function updateProfileUI() {
    const profileName = document.getElementById('profile-name');
    const streakCount = document.getElementById('streak-count');
    
    if (currentUser && currentUser.username) {
        profileName.textContent = currentUser.username;
        streakCount.textContent = totalStreaks;
    } else {
        profileName.textContent = 'Guest';
        streakCount.textContent = 0;
    }
}

// --- NAVIGATION & UI ---

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
    
    const header = document.getElementById('app-header');
    const footer = document.getElementById('app-footer');

    if (pageId === 'login-page' || pageId === 'register-page') {
        header.style.display = 'none';
        footer.style.display = 'none';
    } else {
        header.style.display = 'flex';
        // Note: The Rules page also hides the footer for better focus on content
        footer.style.display = (pageId === 'rewards-page') ? 'block' : 'none'; 
    }
    
    if (pageId === 'sharing-page') {
        renderSharedItemsFeed(); // Refresh the feed when navigating to community page
    }
}

function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function viewProfileDetails() {
    toggleProfileMenu(); 
    if (currentUser) {
        let details = `User Profile for ${currentUser.username}:\n\n`;
        details += `Email: ${currentUser.email}\n`;
        details += `Age: ${currentUser.age || 'N/A'}\n`;
        details += `Location: ${currentUser.location}, ${currentUser.country}\n`;
        details += `Contact: ${currentUser.contact}\n`;
        details += `Emergency Contact: ${currentUser.emergency}\n`;
        details += `Total Streaks: ${totalStreaks}`; 
        
        alert(details);
    } else {
        alert("Please log in to view your profile details.");
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    totalStreaks = 0;
    updateProfileUI();
    showPage('login-page');
    showNotification("Logged out successfully.");
}

function showRegisterForm() {
    showPage('register-page');
}

function showLoginPage() {
    showPage('login-page');
}

// 🆕 NOTIFICATION BAR FUNCTION
function showNotification(message) {
    const bar = document.getElementById('notification-bar');
    bar.querySelector('span').textContent = message;
    bar.style.display = 'block';
    bar.style.animation = 'none'; 
    void bar.offsetWidth; 
    bar.style.animation = 'fadeInOut 3s forwards';
    
    setTimeout(() => {
        bar.style.display = 'none';
    }, 3000);
}

// Function to log streaks and update the counter
function logStreak(streaks) {
    totalStreaks += streaks;
    if (currentUser) {
        currentUser.streaks = totalStreaks;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    updateProfileUI();
    showNotification(`🎉 You earned ${streaks} Streaks!`);
}


// --- AUTHENTICATION MOCKS ---

async function handleRegistration() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const contact = document.getElementById('reg-contact').value;
    
    if (!username || !email || !password || !contact) {
        alert("Please fill in required fields (Username, Email, Password, Contact).");
        return;
    }
    
    try {
        await new Promise(r => setTimeout(r, 500));
        
        const userData = {
            username: username, email: email, contact: contact, password: password,
            age: document.getElementById('reg-age').value,
            country: document.getElementById('reg-country').value,
            location: document.getElementById('reg-location').value,
            address: document.getElementById('reg-address').value,
            emergency: document.getElementById('reg-emergency').value,
            streaks: 0
        };
        
        saveUserState(userData);
        showNotification(`Welcome, ${username}! Registration successful.`);
        showPage('dashboard-page');

    } catch (error) {
        alert("Registration failed due to mock server error.");
        console.error('Registration failed:', error);
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }
    
    // Check localStorage first (if the user already registered in this session)
    if (loadUserState()) {
        showPage('dashboard-page');
        return;
    }

    // MOCK LOGIN: If user has not registered, use default mock data.
    if (email === 'test@eco.com' && password === '123') {
        const mockUser = {
            username: 'EcoTestUser', email: 'test@eco.com', contact: '+91 9876543210',
            location: 'Coimbatore', age: 30, country: 'India', address: '123 Test St', emergency: '911', streaks: 50
        };
        saveUserState(mockUser);
        showNotification(`Welcome back, ${currentUser.username}!`);
        showPage('dashboard-page');
    } else {
        alert("Login failed: Invalid credentials or user not registered. Try 'test@eco.com' or register.");
    }
}


// --- GEO/MOCK AI FUNCTIONS ---

function getGeoLocation() {
    // MOCK GEOLOCATION for Coimbatore, India
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                },
                (error) => {
                    console.warn("Geolocation denied. Using mock location (Coimbatore).");
                    resolve({ latitude: 11.0168, longitude: 76.9558 }); 
                }
            );
        } else {
            resolve({ latitude: 11.0168, longitude: 76.9558 }); 
        }
    });
}

/** * Mocks the AI validation call. */
async function mockAiValidation(promptText) {
    await new Promise(r => setTimeout(r, 2000));
    const isSuccess = true; 

    if (isSuccess) {
        if (promptText.includes("tree")) {
            return {
                isValid: true,
                message: "Validation Success!",
                ecoMetrics: { oxygenGained: "0.01%", co2Reduced: "0.05%", landslideReduced: "0.2%" }
            };
        } else if (promptText.includes("water saving")) {
            return {
                isValid: true, 
                message: "Confirmed: Water saving action/sequence identified!"
            };
        }
    }
    return { isValid: false, message: "AI validation failed. Photo content or geo-tag criteria not met." };
}

async function validateAndLogPlanting() {
    if (!currentUser) return alert("Please log in to submit eco actions.");
    const photoInput = document.getElementById('planted-photo');
    const treeName = document.getElementById('tree-name').value;
    const feedbackElement = document.getElementById('plant-ai-feedback');

    if (photoInput.files.length === 0 || !treeName) return alert("Please upload a photo and enter the tree name.");
    feedbackElement.textContent = "Validating photo and location with Gemini AI...";
    
    try {
        await getGeoLocation();
        const aiResponse = await mockAiValidation("Analyze this image and confirm it is a newly planted tree.");

        if (aiResponse.isValid) {
            logStreak(2); 
            const metrics = aiResponse.ecoMetrics;
            feedbackElement.innerHTML = `✅ **Validation Success!**<br>O₂: ${metrics.oxygenGained}, CO₂: ${metrics.co2Reduced}`;
            photoInput.value = '';
        } else {
            feedbackElement.textContent = `❌ Validation Failed: ${aiResponse.message}`;
        }
    } catch (error) {
        feedbackElement.textContent = `❌ Submission Error: ${error.message}`;
    }
}

async function validateAndLogWaterSaving() {
    if (!currentUser) return alert("Please log in to submit eco actions.");
    const photoInput = document.getElementById('water-photo');
    const feedbackElement = document.getElementById('water-ai-feedback');

    if (photoInput.files.length === 0) return alert("Please upload a water saving photo.");
    feedbackElement.textContent = "Validating action and location with Gemini AI...";
    
    try {
        await getGeoLocation();
        const aiResponse = await mockAiValidation("Analyze this image and confirm it displays a genuine water saving action.");

        if (aiResponse.isValid) {
            logStreak(1); 
            feedbackElement.textContent = `✅ Validation Success! ${aiResponse.message}`;
            photoInput.value = '';
        } else {
            feedbackElement.textContent = `❌ Validation Failed: ${aiResponse.message}`;
        }
    } catch (error) {
        feedbackElement.textContent = `❌ Submission Error: ${error.message}`;
    }
}

async function sendReport() {
    if (!currentUser) return alert("Please log in to submit reports.");
    const email = document.getElementById('reporter-email').value;
    const description = document.getElementById('reporter-description').value;
    const feedbackElement = document.getElementById('report-feedback');

    if (!email || !description) return alert("Please provide a recipient email and a description.");
    feedbackElement.textContent = "Fetching Geo-Tag and preparing message...";

    try {
        await getGeoLocation();
        await new Promise(r => setTimeout(r, 1500)); 
        
        showNotification(`🚨 Report simulatedly sent to ${email}!`);
        feedbackElement.innerHTML = `✅ **Report Sent!**`;
        document.getElementById('reporter-email').value = '';
        document.getElementById('reporter-description').value = '';

    } catch (error) {
        feedbackElement.textContent = `❌ Submission Error: Could not verify location.`;
    }
}

async function findRestaurants() {
    const feedbackElement = document.getElementById('restaurant-feedback');
    feedbackElement.innerHTML = "Fetching location and consulting Gemini AI for local dining...";
    
    try {
        await getGeoLocation();
        await new Promise(r => setTimeout(r, 2500)); 

        const mockResults = [
            { name: "Sree Annapoorna", type: "Non-Vegan", distance: "0.9 km" },
            { name: "Arogya Vegan Cafe", type: "Vegan", distance: "4.1 km" },
            { name: "Kovai Dindigul Thalappakatti", type: "Non-Vegan", distance: "2.5 km" },
            { name: "Healthy Roots Tiffin", type: "Vegan (South Indian)", distance: "3.2 km" },
        ];
        
        let output = `<div style="text-align: left; margin-top: 10px;">
                <p>📍 Results near Coimbatore:</p><ul style="padding-left: 20px;">`;

        mockResults.forEach(r => {
            const colorStyle = r.type.includes("Vegan") ? 'style="color: #FFEEAA;"' : ''; 
            output += `<li ${colorStyle}><strong>${r.name}</strong> (${r.type}) - ${r.distance}</li>`;
        });
        
        output += `</ul></div>`;
        feedbackElement.innerHTML = output;

    } catch (error) {
        feedbackElement.textContent = `❌ Search Error: Could not get location.`;
    }
}

// --- COMMUNITY SHARING ---

function renderSharedItemsFeed() {
    const feed = document.getElementById('shared-items-feed');
    loadSharedItems(); // Load the latest global state every time the feed is viewed
    
    if (sharedItems.length === 0) {
        feed.innerHTML = `<p>No items shared yet. Be the first!</p>`;
        return;
    }

    feed.innerHTML = sharedItems.map((item, index) => {
        let tag = '';
        let price = '';
        let colorClass = '';

        if (item.type === 'Cloth') {
            tag = 'FREE CLOTHING';
            price = 'FREE';
            colorClass = 'white-bg';
        } else if (item.type === 'Product') {
            tag = item.listingType.toUpperCase();
            price = item.listingType === 'For Free' ? 'FREE' : 'See Listing';
            colorClass = item.listingType === 'For Free' ? 'white-bg' : 'green-bg';
        } else if (item.type === 'Food') {
            tag = item.discountType.toUpperCase();
            price = item.discountType;
            colorClass = 'red-bg';
        }

        return `
            <div class="shared-item-card ${colorClass}">
                <div class="item-image-placeholder">PHOTO PREVIEW</div>
                <h5 style="color: ${colorClass === 'red-bg' ? 'white' : 'var(--color-darkgreen)'}">${item.itemName} (${item.type})</h5>
                <p style="color: ${colorClass === 'red-bg' ? 'white' : 'var(--color-black)'}">
                    Status: ${tag} | Price: ${price}
                </p>
                <p style="margin: 5px 0;">
                    <strong style="color: ${colorClass === 'red-bg' ? 'white' : 'var(--color-darkred)'}">Contact: ${item.contact}</strong>
                </p>
                <small style="color: ${colorClass === 'red-bg' ? '#EEE' : '#888'}">
                    Posted by ${item.user} - Approx ${index + 1} km away
                </small>
                <button onclick="viewItemDetails(${item.id})" class="btn-darkred" style="margin-top: 5px; padding: 5px 10px; font-size: 0.8em;">View Details</button>
            </div>
        `;
    }).join('');
}

function viewItemDetails(itemId) {
    const item = sharedItems.find(i => i.id === itemId);

    if (!item) return alert("Error: Item details not found.");

    let details = `\n--- ITEM DETAILS ---\n\n`;
    details += `Item Name: ${item.itemName}\n`;
    details += `Type: ${item.type}\n`;
    details += `Listing: ${item.listingType || item.discountType}\n`;
    details += `Price/Cost: ${item.price}\n\n`;
    details += `Posted By: ${item.user}\n`;
    details += `Contact: ${item.contact}\n`;
    details += `Photo: (Photo display simulated. Real photo uploaded to server.)\n`;
    
    alert(details);
}

function shareItem(itemType) {
    if (!currentUser) return alert("Please log in to share items.");
    
    let itemName = '';
    let listingType = '';
    let price = '';
    let photoInput = null;

    if (itemType === 'Cloth') {
        itemName = document.getElementById('cloth-item-name').value;
        listingType = 'For Free';
        price = 'FREE';
        photoInput = document.getElementById('cloth-photo');
    } else if (itemType === 'Product') {
        itemName = document.getElementById('product-item-name').value;
        listingType = document.getElementById('product-listing-type').value;
        price = listingType === 'For Free' ? 'FREE' : 'See Listing';
        photoInput = document.getElementById('product-photo');
    } else if (itemType === 'Food') {
        itemName = document.getElementById('food-item-name').value;
        price = document.getElementById('food-original-price').value;
        listingType = document.getElementById('food-discount-type').value; 
        photoInput = document.getElementById('food-photo');
    }

    if (!itemName || photoInput.files.length === 0) return alert("Please fill all details and upload a photo.");

    const streaksAwarded = (listingType === 'For Free' || listingType === 'Half Price' || listingType === 'Quarter Price') ? 5 : 0;

    const newItem = {
        id: Date.now(),
        type: itemType,
        itemName: itemName,
        listingType: listingType,
        discountType: listingType,
        user: currentUser.username,
        contact: currentUser.contact,
        price: price
    };
    sharedItems.unshift(newItem); 

    // Update localStorage for multi-login persistence
    saveSharedItems();

    if (streaksAwarded > 0) logStreak(streaksAwarded);
    else showNotification(`✅ Listed ${itemName} for ${listingType}!`);
    
    // Clear the file input and re-render
    document.getElementById(itemType.toLowerCase() + '-photo').value = ''; 

    renderSharedItemsFeed(); 
}


// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load data from local storage
    loadSharedItems();
    
    // 2. Check for existing user on load
    if (loadUserState()) {
        showPage('dashboard-page');
    } else {
        showPage('login-page');
    }
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetPage = event.target.getAttribute('data-target');
            showPage(targetPage);
        });
    });
});