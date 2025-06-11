import { db, ref, onValue, set, push, storage, storageRef, uploadBytes, getDownloadURL, auth } from './config.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const resourceTableBody = document.getElementById('resourceTableBody');
const tabButtons = document.querySelectorAll('.tab-button');
const addResourceBtn = document.getElementById('addResourceBtn');
const resourceModal = document.getElementById('resourceModal');
const resourceForm = document.getElementById('resourceForm');
const notificationButton = document.getElementById('notificationButton');
const notificationsPanel = document.getElementById('notificationsPanel');
const notificationsList = document.querySelector('.notifications-list');
const notificationBadge = document.querySelector('.notification-badge');
const totalRequestsEl = document.getElementById('totalRequests');
const pendingRequestsEl = document.getElementById('pendingRequests');
const approvedRequestsEl = document.getElementById('approvedRequests');
const rejectedRequestsEl = document.getElementById('rejectedRequests');
const barChartCanvas = document.getElementById('barChart');
const pieChartCanvas = document.getElementById('pieChart');

// State
let barChart, pieChart;
let notifications = [];
let isEditing = false;
let editingResourceId = null;
let cachedUsers = {}; // Cache user data for performance

// Utility Functions
const logError = (message, error) => console.error(`[AdminDash] ${message}:`, error);

// Data Fetching
const fetchDataRealTime = (path, callback) => {
    const dataRef = ref(db, path);
    onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        const dataArray = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
        callback(dataArray);
    }, (error) => logError(`Failed to fetch ${path}`, error));
};

const fetchUserData = async (userId) => {
    if (cachedUsers[userId]) return cachedUsers[userId];
    const userRef = ref(db, `users/${userId}`);
    return new Promise((resolve) => {
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val() || {};
            cachedUsers[userId] = userData;
            resolve(userData);
        }, { onlyOnce: true });
    });
};

// Rendering Functions
const createResourceRow = (resource) => `
    <tr data-id="${resource.id}">
        <td>${resource.title}</td>
        <td>${resource.type}</td>
        <td>${resource.description}</td>
        <td><span class="status-badge ${resource.status.toLowerCase()}">${resource.status}</span></td>
        <td>
            <button class="action-button edit">Edit</button>
            <button class="action-button delete">Delete</button>
        </td>
    </tr>
`;

const createRequestRow = (request, requesterEmail) => {
    const statusClass = request.status.toLowerCase();
    let actions = `` ;/* `
        <button class="action-button edit">Edit</button>
        <button class="action-button delete">Delete</button>
    `;*/
    if (statusClass === 'pending') {
        actions += `
            <button class="action-button approve">Approve</button>
            <button class="action-button reject">Reject</button>
        `;
    }
    return `
        <tr data-id="${request.id}">
            <td>${request.title}</td>
            <td>${request.type}</td>
            <td>${request.description}</td>
            <td>${request.id.email}</td>
            <td><span class="status-badge ${statusClass}">${request.status}</span></td>
            <td>${actions}</td>
        </tr>
    `;
};

const renderTable = (searchTerm = '') => {
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;
    const searchLower = searchTerm.toLowerCase();

    if (activeTab === 'all') {
        fetchDataRealTime('resources', (resources) => {
            const filtered = resources.filter(r =>
                r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower)
            );
            resourceTableBody.innerHTML = filtered.length
                ? filtered.map(createResourceRow).join('')
                : '<tr><td colspan="5" class="text-center p-4">No resources found.</td></tr>';
        });
    } else if (activeTab === 'pending') {
        fetchDataRealTime('requests', (resources) => {
            const filtered = resources.filter(r => r.status === 'pending' && (
                r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower))
            );
            resourceTableBody.innerHTML = filtered.length
                ? filtered.map(createRequestRow).join('')
                : '<tr><td colspan="5" class="text-center p-4">No resources found.</td></tr>';
        });
    } else if (activeTab === 'rejected') {
        fetchDataRealTime('requests', (resources) => {
            const filtered = resources.filter(r => r.status === 'rejected' && (
                r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower))
            );
            resourceTableBody.innerHTML = filtered.length
                ? filtered.map(createRequestRow).join('')
                : '<tr><td colspan="5" class="text-center p-4">No resources found.</td></tr>';
        });
    } else if (activeTab === 'approved') {
        fetchDataRealTime('requests', (resources) => {
            const filtered = resources.filter(r => r.status === 'approved' && (
                r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower))
            );
            resourceTableBody.innerHTML = filtered.length
                ? filtered.map(createRequestRow).join('')
                : '<tr><td colspan="5" class="text-center p-4">No resources found.</td></tr>';
        });
    } 

    

    /*
    {
        fetchDataRealTime('requests', async (requests) => {
            const filtered = requests.filter(r =>
                r.status.toLowerCase() === activeTab &&
                (r.title.toLowerCase().includes(searchLower) ||
                 r.description.toLowerCase().includes(searchLower))
            );
            const rows = await Promise.all(filtered.map(async (request) => {
                const userData = await fetchUserData(request.studentId);
                return createRequestRow(request, userData.email);
            }));
            resourceTableBody.innerHTML = rows.length
                ? rows.join('')
                : `<tr><td colspan="6" class="text-center p-4">No ${activeTab} requests.</td></tr>`;
        });
    } */
};

// Stats and Chart Updates
const updateStatsAndCharts = () => {
    fetchDataRealTime('requests', (requests) => {
        fetchDataRealTime('resources', (resources) => {
            const totalRequests = requests.length;
            const pendingRequests = requests.filter(r => r.status.toLowerCase() === 'pending').length;
            const approvedRequests = requests.filter(r => r.status.toLowerCase() === 'approved').length;
            const rejectedRequests = requests.filter(r => r.status.toLowerCase() === 'rejected').length;

            totalRequestsEl.textContent = totalRequests;
            pendingRequestsEl.textContent = pendingRequests;
            approvedRequestsEl.textContent = approvedRequests;
            rejectedRequestsEl.textContent = rejectedRequests;

            const requestCounts = {};
            requests.forEach(request => {
                const resource = resources.find(r => r.id === request.resourceId);
                const title = resource ? resource.title : 'Unknown';
                requestCounts[title] = (requestCounts[title] || 0) + 1;
            });

            if (barChart) barChart.destroy();
            if (pieChart) pieChart.destroy();

            barChart = new Chart(barChartCanvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(requestCounts),
                    datasets: [{
                        label: 'Requests',
                        data: Object.values(requestCounts),
                        backgroundColor: '#60a5fa',
                    }]
                },
                options: { scales: { y: { beginAtZero: true } } }
            });

            pieChart = new Chart(pieChartCanvas, {
                type: 'pie',
                data: {
                    labels: Object.keys(requestCounts),
                    datasets: [{
                        data: Object.values(requestCounts),
                        backgroundColor: ['#60a5fa', '#34d399', '#f87171', '#fbbf24', '#a78bfa'],
                    }]
                },
                options: { responsive: true }
            });
        });
    });
};

// Notification Handling
const addNotification = (title, message) => {
    notifications.unshift({ id: Date.now(), title, message, time: new Date(), read: false });
    updateNotifications();
};

const sendNotificationToStudent = async (studentId, title, message) => {
    try {
        const notificationsRef = ref(db, `studentNotifications/${studentId}`);
        await set(push(notificationsRef), {
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false
        });
    } catch (error) {
        logError('Failed to send student notification', error);
    }
};

const updateNotifications = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    notificationBadge.textContent = unreadCount;
    notificationBadge.style.display = unreadCount ? 'flex' : 'none';
    notificationsList.innerHTML = notifications.length
        ? notifications.map(n => `
            <div class="notification-item" data-id="${n.id}">
                <div class="notification-header">
                    <span class="notification-title">${n.title}</span>
                    <span class="notification-time">${n.time.toLocaleTimeString()}</span>
                </div>
                <p class="notification-message">${n.message}</p>
            </div>
        `).join('')
        : '<p class="text-center text-gray-500 p-4">No notifications</p>';
};

// Event Handlers
const setupEventListeners = () => {
    searchInput.addEventListener('input', (e) => renderTable(e.target.value));

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'text-blue-600', 'border-blue-600');
                btn.classList.add('text-gray-600');
            });
            button.classList.add('active', 'text-blue-600', 'border-blue-600');
            renderTable();
        });
    });

    addResourceBtn.addEventListener('click', () => {
        isEditing = false;
        editingResourceId = null;
        document.getElementById('modalTitle').textContent = 'Add New Resource';
        resourceForm.reset();
        document.getElementById('fileUploadGroup').style.display = 'none';
        resourceModal.classList.remove('hidden');
    });

    resourceModal.querySelector('.close-button').addEventListener('click', () => {
        resourceModal.classList.add('hidden');
    });

    resourceModal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        resourceModal.classList.add('hidden');
    });

    document.getElementById('type').addEventListener('change', (e) => {
        document.getElementById('fileUploadGroup').style.display = e.target.value === 'pdf' ? 'block' : 'none';
    });

    resourceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(resourceForm);
        const resourceData = {
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            status: 'available',
            createdAt: new Date().toISOString()
        };

        try {
            if (resourceData.type === 'pdf') {
                const file = formData.get('fileUpload');
                if (file && file.size > 0) {
                    const fileRef = storageRef(storage, `resources/${file.name}`);
                    await uploadBytes(fileRef, file);
                    resourceData.fileUrl = await getDownloadURL(fileRef);
                }
            }
            const resourceRef = isEditing ? ref(db, `resources/${editingResourceId}`) : push(ref(db, 'resources'));
            await set(resourceRef, resourceData);
            addNotification('Resource Saved', `${resourceData.title} has been ${isEditing ? 'updated' : 'added'}.`);
            resourceModal.classList.add('hidden');
        } catch (error) {
            logError('Failed to save resource', error);
            addNotification('Error', 'Failed to save resource.');
        }
    });

    resourceTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        const id = row.dataset.id;
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;

        try {
            if (e.target.classList.contains('edit')) {
                const path = activeTab === 'all' ? 'resources' : 'requests';
                fetchDataRealTime(path, async (data) => {
                    const item = data.find(i => i.id === id);
                    if (!item) return;
                    isEditing = true;
                    editingResourceId = id;
                    document.getElementById('modalTitle').textContent = activeTab === 'all' ? 'Edit Resource' : 'Edit Request';
                    document.getElementById('title').value = item.title;
                    document.getElementById('type').value = item.type;
                    document.getElementById('description').value = item.description;
                    document.getElementById('fileUploadGroup').style.display = item.type === 'pdf' ? 'block' : 'none';
                    resourceModal.classList.remove('hidden');
                });
            } else if (e.target.classList.contains('delete')) {
                if (confirm('Are you sure you want to delete this item?')) {
                    const path = activeTab === 'all' ? `resources/${id}` : `requests/${id}`;
                    await set(ref(db, path), null);
                    addNotification('Item Deleted', 'Item removed successfully.');
                }
            } else if (e.target.classList.contains('approve')) {
                fetchDataRealTime('requests', async (requests) => {
                    const request = requests.find(r => r.id === id);
                    if (!request) return;
                    await set(ref(db, `requests/${id}`), { ...request, status: 'approved' });
                    addNotification('Request Approved', `${request.title} approved.`);
                    await sendNotificationToStudent(request.studentId, 'Request Approved', `${request.title} has been approved.`);
                });
            } else if (e.target.classList.contains('reject')) {
                fetchDataRealTime('requests', async (requests) => {
                    const request = requests.find(r => r.id === id);
                    if (!request) return;
                    await set(ref(db, `requests/${id}`), { ...request, status: 'rejected' });
                    addNotification('Request Rejected', `${request.title} rejected.`);
                    await sendNotificationToStudent(request.studentId, 'Request Rejected', `${request.title} has been rejected.`);
                });
            }
        } catch (error) {
            logError('Action failed', error);
            addNotification('Error', 'Action failed.');
        }
    });

    notificationButton.addEventListener('click', () => {
        notificationsPanel.classList.toggle('hidden');
        notifications.forEach(n => n.read = true);
        updateNotifications();
    });

    document.querySelector('.clear-all-button').addEventListener('click', () => {
        notifications = [];
        updateNotifications();
    });

    document.addEventListener('click', (e) => {
        if (!notificationsPanel.contains(e.target) && !notificationButton.contains(e.target)) {
            notificationsPanel.classList.add('hidden');
        }
    });
};

// Initialization
const initDashboard = () => {
    renderTable();
    updateStatsAndCharts();
    setupEventListeners();
};

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();

    const logoutBtn = document.querySelector('a[onclick="handleLogout()"]');
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            logError('Logout failed', error);
        }
    });
});