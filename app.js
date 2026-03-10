// --- Elements & State ---
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const issuesContainer = document.getElementById('issues-container');
const loadingSpinner = document.getElementById('loading-spinner');
const issueCount = document.getElementById('issue-count');
const tabButtons = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

let allIssues = [];
let currentTab = 'all';
const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';

// --- Auth Logic ---
function checkAuth() {
    if (localStorage.getItem('isAuthenticated') === 'true') {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        if(allIssues.length === 0) fetchIssues();
    } else {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
}
checkAuth();

document.getElementById('login-btn').addEventListener('click', () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user === 'admin' && pass === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        checkAuth();
    } else {
        alert('Invalid Credentials!');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('isAuthenticated');
    checkAuth();
});

// --- API Calls ---
async function fetchIssues() {
    showLoading(true);
    try {
        const res = await fetch(`${API_BASE}/issues`);
        const data = await res.json();
        allIssues = data.data;
        renderIssues();
    } catch (err) { console.error(err); } finally { showLoading(false); }
}

async function searchIssues(query) {
    showLoading(true);
    try {
        const res = await fetch(`${API_BASE}/issues/search?q=${query}`);
        const data = await res.json();
        allIssues = data.data || []; 
        renderIssues();
    } catch (err) { console.error(err); } finally { showLoading(false); }
}

// --- Render Cards ---
function renderIssues() {
    issuesContainer.innerHTML = ''; 
    
    let filteredIssues = allIssues;
    if (currentTab === 'open') filteredIssues = allIssues.filter(i => i.status.toLowerCase() === 'open');
    if (currentTab === 'closed') filteredIssues = allIssues.filter(i => i.status.toLowerCase() === 'closed');

    issueCount.innerText = filteredIssues.length;

    if(filteredIssues.length === 0) {
        issuesContainer.innerHTML = `<div class="col-span-full text-center text-gray-500 py-10 font-bold">No issues found.</div>`;
        return;
    }

    filteredIssues.forEach(issue => {
        const isClosed = issue.status.toLowerCase() === 'closed';
        const statusIcon = isClosed ? './assets/Closed- Status .png' : './assets/Open-Status.png';
        const dateStr = new Date(issue.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const priorityText = issue.priority || 'Normal';
        
        const issueId = issue.id || issue._id;
        const authorName = issue.author?.name || issue.author || 'Unknown';

        // Label Colors & Icons Logic
        let labelsHTML = '';
        if (issue.labels && issue.labels.length > 0) {
            labelsHTML = issue.labels.map(label => {
                let badgeClass = 'bg-blue-100 text-blue-700 border-blue-200'; 
                let iconHTML = ''; 

                if (label.toLowerCase().includes('bug')) {
                    badgeClass = 'bg-red-100 text-red-700 border-red-200';
                    iconHTML = '<i class="fa-solid fa-bug mr-1"></i>';
                } 
                else if (label.toLowerCase().includes('help')) {
                    badgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                    iconHTML = '<i class="fa-solid fa-circle-radiation mr-1"></i>';
                } 
                else if (label.toLowerCase().includes('enhancement')) {
                    badgeClass = 'bg-purple-100 text-purple-700 border-purple-200';
                }
                return `<span class="flex items-center px-2.5 py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide rounded-full border ${badgeClass}">${iconHTML}${label}</span>`;
            }).join('');
        } else {
            labelsHTML = `<span class="px-2.5 py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide rounded-full bg-gray-100 text-gray-600 border border-gray-200">NO LABEL</span>`;
        }

        const cardHTML = `
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full cursor-pointer relative overflow-hidden border border-gray-200" onclick="openIssueModal('${issueId}')">
                <div class="absolute top-0 left-0 w-full h-1.5 ${isClosed ? 'bg-purple-600' : 'bg-green-500'}"></div>
                <div class="p-4 sm:p-5 flex flex-col h-full mt-1">
                    
                    <div class="flex justify-between items-start mb-3">
                        <span class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${isClosed ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'} border">
                            <img src="${statusIcon}" class="w-3 h-3 sm:w-3.5 sm:h-3.5"> <span class="capitalize">${issue.status}</span>
                        </span>
                        <span class="px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-orange-50 text-orange-600 border border-orange-200 capitalize">
                            ${priorityText}
                        </span>
                    </div>

                    <h2 class="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2 hover:text-blue-600">${issue.title}</h2>
                    
                    <p class="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">${issue.description || 'No description provided.'}</p>

                    <div class="flex flex-wrap gap-2 mb-4 flex-grow content-start">
                        ${labelsHTML}
                    </div>

                    <div class="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-1 text-[11px] sm:text-xs">
                        <div class="text-gray-500 font-medium">
                            Post by <span class="font-bold text-gray-800">${authorName}</span>
                        </div>
                        <div class="font-bold text-gray-400 flex items-center gap-1">
                            📅 ${dateStr}
                        </div>
                    </div>
                </div>
            </div>
        `;
        issuesContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// --- Modal Logic ---
async function openIssueModal(id) {
    const modal = document.getElementById('issue_modal');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `<div class="text-center py-10"><div class="loader"></div><p class="mt-4 text-gray-500 font-medium">Loading details...</p></div>`;
    modal.showModal();

    try {
        const res = await fetch(`${API_BASE}/issue/${id}`);
        if (!res.ok) throw new Error("Data not found");
        
        const responseData = await res.json();
        const issue = responseData.data ? responseData.data : responseData; 

        const dateStr = new Date(issue.createdAt || new Date()).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        const authorName = issue.author?.name || issue.author || 'Unknown';

        content.innerHTML = `
            <div class="mb-4 sm:mb-6">
                <h3 class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3">${issue.title}</h3>
                <div class="flex flex-wrap gap-2">
                    <span class="badge ${issue.status?.toLowerCase() === 'open' ? 'badge-success text-white' : 'badge-neutral'} font-bold px-3 py-3">${issue.status}</span>
                    <span class="badge badge-outline font-bold px-3 py-3 border-gray-300 text-gray-700">${issue.priority || 'Normal'}</span>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 mb-4 sm:mb-6">
                <h4 class="font-extrabold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">Description</h4>
                <p class="text-gray-600 whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed max-h-48 sm:max-h-none overflow-y-auto">${issue.description || 'No details provided.'}</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-6 text-xs sm:text-sm bg-blue-50/40 p-4 sm:p-6 rounded-xl border border-blue-100">
                <div>
                    <span class="text-gray-500 block mb-1 text-[10px] sm:text-xs uppercase tracking-wide font-bold">Author</span>
                    <strong class="text-gray-900 text-sm sm:text-base flex items-center gap-2">
                        Post by ${authorName}
                    </strong>
                </div>
                <div>
                    <span class="text-gray-500 block mb-1 text-[10px] sm:text-xs uppercase tracking-wide font-bold">Created At</span>
                    <strong class="text-gray-900 text-sm sm:text-base">📅 ${dateStr}</strong>
                </div>
                <div>
                    <span class="text-gray-500 block mb-1 text-[10px] sm:text-xs uppercase tracking-wide font-bold">Labels</span>
                    <strong class="text-gray-900 text-sm sm:text-base text-blue-600">🏷️ ${issue.labels?.join(', ') || 'None'}</strong>
                </div>
                <div>
                    <span class="text-gray-500 block mb-1 text-[10px] sm:text-xs uppercase tracking-wide font-bold">Issue ID</span>
                    <strong class="text-gray-900 text-[10px] sm:text-xs font-mono bg-gray-200 px-2 py-1 rounded break-all">#${issue._id || issue.id}</strong>
                </div>
            </div>

            <div class="modal-action mt-6 sm:mt-8 flex justify-center sm:justify-end">
                <form method="dialog" class="w-full sm:w-auto">
                    <button class="btn btn-neutral w-full sm:w-auto sm:px-8">Close</button>
                </form>
            </div>
        `;
    } catch (err) {
        console.error("Modal Fetch Error:", err);
        content.innerHTML = `
            <div class="text-center py-10">
                <svg class="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-red-600 text-base sm:text-lg font-bold">Failed to load issue details.</p>
                <p class="text-gray-500 text-xs sm:text-sm mt-2">The API might be down or the ID is invalid.</p>
            </div>
            <div class="modal-action flex justify-center sm:justify-end">
                <form method="dialog" class="w-full sm:w-auto">
                    <button class="btn btn-neutral w-full sm:w-auto sm:px-8">Close</button>
                </form>
            </div>
        `;
    }
}

// --- Tabs & Search Events ---
tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tabButtons.forEach(b => { b.classList.remove('bg-gray-800', 'text-white'); b.classList.add('bg-white'); });
        e.target.classList.remove('bg-white');
        e.target.classList.add('bg-gray-800', 'text-white');
        
        currentTab = e.target.getAttribute('data-tab');
        renderIssues();
    });
});

document.querySelector('[data-tab="all"]').classList.add('bg-gray-800', 'text-white');

searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    q ? searchIssues(q) : fetchIssues();
});
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBtn.click(); });

function showLoading(show) {
    if (show) { loadingSpinner.classList.remove('hidden'); issuesContainer.innerHTML = ''; }
    else { loadingSpinner.classList.add('hidden'); }
}