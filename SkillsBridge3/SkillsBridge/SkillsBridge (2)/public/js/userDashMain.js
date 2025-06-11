import { db, ref, onValue, set, push, auth, onAuthStateChanged } from './config.js';

// Resource type images (replace with actual paths)
const resourceImages = {
    pdf: 'images/pdf-placeholder.jpg',
    training: 'images/training-placeholder.jpg',
    course: 'images/course-placeholder.jpg'
};

// DOM elements
const searchInput = document.getElementById('searchInput');
const resourceGrid = document.getElementById('resourceGrid');
const tabButtons = document.querySelectorAll('.tab-button');
const requestNewResourceBtn = document.getElementById('requestNewResourceBtn');
const requestModal = document.getElementById('requestModal');
const requestForm = document.getElementById('requestForm');
const notificationButton = document.getElementById('notificationButton');
const profileButton = document.getElementById('profileButton');
const profileModal = document.getElementById('profileModal');
const profileContent = document.getElementById('profileContent');
const userNameElement = document.getElementById('userName');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let notifications = [];
let currentPage = 1;
const itemsPerPage = 12;

// Create resource card with image
function createResourceCard(resource, isRequest = false) {
    const statusClass = (resource.status || 'available').toLowerCase();
    let actions = '';
    if (!isRequest && statusClass === 'available') {
        actions = `<button class="action-button request">Request</button>`;
    } else if (isRequest) {
        if (statusClass === 'pending' || statusClass === 'rejected') {
            actions = `<button class="action-button cancel">Cancel</button>`;
        } else if (statusClass === 'approved') {
            actions = `<a href="${resource.fileUrl || 'documents/sample-resource.pdf'}" class="action-button download" target="_blank">Download</a>`;
        }
    }
    return `
        <div class="resource-card bg-white rounded-lg shadow-md" data-id="${resource.id}">
            <img src="${resourceImages[resource.type]}" alt="${resource.type}" class="resource-image">
            <div class="resource-content">
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.description}</p>
                <div class="resource-footer">
                    <span class="resource-type">${resource.type}</span>
                    <span class="status-badge ${statusClass}">${isRequest ? resource.status : 'Available'}</span>
                </div>
                <div class="mt-2">${actions}</div>
            </div>
        </div>
    `;
}

// Fetch data from Firebase
function fetchData(path, callback) {
    const dataRef = ref(db, path);
    onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        const dataArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        callback(dataArray);
    });
}

// Fetch user data once
async function fetchUserDataOnce(userId) {
    return new Promise((resolve) => {
        const userRef = ref(db, `users/${userId}`);
        onValue(userRef, (snapshot) => resolve(snapshot.val()), { onlyOnce: true });
    });
}

// Render resources or requests with pagination
function renderResources(searchTerm = '') {
    const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
    const searchLower = searchTerm.toLowerCase();
    const user = auth.currentUser;

    if (!user) {
        resourceGrid.innerHTML = '<div class="col-span-full text-center p-6 bg-white rounded-lg shadow-md"><p class="text-gray-600">Please log in to view resources.</p></div>';
        return;
    }

    if (activeTab === 'resources') {
        fetchData('resources', (resources) => {
            let displayResources = resources.filter(r =>
                r.status === 'available' &&
                (r.title.toLowerCase().includes(searchLower) || r.description.toLowerCase().includes(searchLower))
            );
            const totalItems = displayResources.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedResources = displayResources.slice(startIndex, startIndex + itemsPerPage);

            resourceGrid.innerHTML = paginatedResources.length
                ? paginatedResources.map(r => createResourceCard(r)).join('')
                : '<div class="col-span-full text-center p-6 bg-white rounded-lg shadow-md"><p class="text-gray-600">No resources found.</p></div>';

            updatePagination(totalPages);
        });
    } else if (activeTab === 'requests') {
        fetchData('requests', (requests) => {
            let displayRequests = requests.filter(r =>
                r.studentId === user.uid &&
                (r.title.toLowerCase().includes(searchLower) || r.description.toLowerCase().includes(searchLower))
            );
            const totalItems = displayRequests.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedRequests = displayRequests.slice(startIndex, startIndex + itemsPerPage);

            resourceGrid.innerHTML = paginatedRequests.length
                ? paginatedRequests.map(r => createResourceCard(r, true)).join('')
                : '<div class="col-span-full text-center p-6 bg-white rounded-lg shadow-md"><p class="text-gray-600">You have no requests.</p></div>';

            updatePagination(totalPages);
        });
    }
}

// Update pagination controls
function updatePagination(totalPages) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages || totalPages === 0;
}

// Send notification to admin
async function sendNotificationToAdmin(studentId, title, message) {
    const notificationsRef = ref(db, 'adminNotifications');
    const newNotificationRef = push(notificationsRef);
    const notificationData = {
        title,
        message,
        timestamp: new Date().toISOString(),
        studentId,
        read: false,
        customRequestId: newNotificationRef.key
    };
    try {
        await set(newNotificationRef, notificationData);
    } catch (error) {
        console.error('Error sending notification to admin:', error);
    }
}

// Add notification locally
function addNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Listen for student notifications
function listenForNotifications(studentId) {
    const notificationsRef = ref(db, `studentNotifications/${studentId}`);
    onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        notifications = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        const unreadCount = notifications.filter(n => !n.read).length;
        document.querySelector('.notification-badge').textContent = unreadCount;
        document.querySelector('.notification-badge').style.display = unreadCount ? 'flex' : 'none';
    });
}

// Initialize dashboard
function initDashboard(user) {
    const displayName = user.displayName || user.email.split('@')[0] || 'User';
    userNameElement.textContent = `Hello, ${displayName.toUpperCase()}`;
    renderResources();
    listenForNotifications(user.uid);

    searchInput.addEventListener('input', (e) => {
        currentPage = 1;
        renderResources(e.target.value);
    });

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active', 'text-blue-600', 'border-blue-600'));
            btn.classList.add('active', 'text-blue-600', 'border-blue-600');
            currentPage = 1;
            searchInput.value = '';
            renderResources();
        });
    });

    prevPage.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderResources(searchInput.value);
        }
    });

    nextPage.addEventListener('click', () => {
        currentPage++;
        renderResources(searchInput.value);
    });

    requestNewResourceBtn.addEventListener('click', () => requestModal.classList.add('active'));

    requestModal.querySelector('.close-button').addEventListener('click', () => {
        requestModal.classList.remove('active');
        requestForm.reset();
    });

    requestModal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        requestModal.classList.remove('active');
        requestForm.reset();
    });

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(requestForm);
        const requestData = {
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            studentId: user.uid,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            const requestsRef = ref(db, 'customRequests');
            const newRequestRef = push(requestsRef);
            await set(newRequestRef, requestData);
            await sendNotificationToAdmin(user.uid, 'New Resource Request', `${requestData.title} requested by ${user.email}`);
            addNotification('Request submitted successfully!');
            requestModal.classList.remove('active');
            requestForm.reset();
            renderResources();
        } catch (error) {
            console.error(' PUBLIC Error submitting request:', error);
            addNotification('Failed to submit request.');
        }
    });

    profileButton.addEventListener('click', async () => {
        const userData = await fetchUserDataOnce(user.uid);
        profileContent.innerHTML = `
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${userData.role || 'Student'}</p>
            ${userData.displayName ? `<p><strong>Name:</strong> ${userData.displayName}</p>` : ''}
        `;
        profileModal.classList.add('active');
    });

    profileModal.querySelector('.close-button').addEventListener('click', () => {
        profileModal.classList.remove('active');
    });

    resourceGrid.addEventListener('click', async (e) => {
        const card = e.target.closest('.resource-card');
        if (!card) return;
        const resourceId = card.dataset.id;

        if (e.target.classList.contains('request')) {
            fetchData('resources', async (resources) => {
                const resource = resources.find(r => r.id === resourceId);
                if (!resource) return;
                const requestData = {
                    ...resource,
                    studentId: user.uid,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                const requestsRef = ref(db, 'requests');
                const newRequestRef = push(requestsRef);
                await set(newRequestRef, requestData);
                await sendNotificationToAdmin(user.uid, 'Resource Request', `${resource.title} requested by ${user.email}`);
                addNotification('Resource requested successfully!');
                renderResources();
            });
        } else if (e.target.classList.contains('cancel')) {
            fetchData('requests', async (requests) => {
                const request = requests.find(r => r.id === resourceId);
                if (!request || request.studentId !== user.uid) return;
                await set(ref(db, `requests/${resourceId}`), null);
                addNotification('Request cancelled successfully!');
                renderResources();
            });
        }
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        initDashboard(user);
    } else {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('a[onclick="handleLogout()"]');
    logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });
});