// @JUMA_SAMWEL - Combined Frontend Logic

// --- Configuration ---
const API_BASE_URL = 'https://juma-afiya-system.onrender.com'; // Your Django backend URL

// --- Utility Functions (Common) ---

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showAlert(message, type = 'danger', area, dismissible = true) {
    if (!area) {
        console.warn("Alert area not provided for message:", message);
        return; // Don't proceed if the area doesn't exist
    }
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} fade show" role="alert">
            ${message}
            ${dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' : ''}
        </div>
    `;
    // Clear previous global alerts if adding to the main global area
    if (area.id === 'global-alert-area') { area.innerHTML = ''; }
    area.append(wrapper);
}

// Updated showFormStatus based on your snippet's usage (no auto-hide by default)
function showFormStatus(element, message, isSuccess = true, autoHideDelay = 0) { // Default autoHideDelay to 0
     if (!element) return;
     element.textContent = message;
     // Use className from your snippet for login status
     element.className = `mt-3 text-center ${isSuccess ? 'text-success' : 'text-danger'}`;
     element.classList.remove('hidden'); // Ensure it's visible

     // Clear previous timeouts if any
     if (element.timeoutId) {
         clearTimeout(element.timeoutId);
         element.timeoutId = null;
     }

     // Only set timeout if autoHideDelay is greater than 0
     if (autoHideDelay > 0) {
        element.timeoutId = setTimeout(() => {
            element.classList.add('hidden');
            element.textContent = ''; // Clear text after hiding
            element.timeoutId = null; // Reset timeout ID
        }, autoHideDelay);
     }
 }


function setButtonLoading(button, isLoading) {
    if (!button) return;
    const spinner = button.querySelector('.spinner-border');
    if (isLoading) {
        button.disabled = true;
        spinner?.classList.remove('hidden');
    } else {
        button.disabled = false;
        spinner?.classList.add('hidden');
    }
}

function showLoadingIndicator(element) { element?.classList.remove('hidden'); }
function hideLoadingIndicator(element) { element?.classList.add('hidden'); }

// --- API Call Function (Common) ---
async function apiRequest(url, options = {}) {
    const csrfToken = getCookie('csrftoken'); // Get token
    // --- Add this console log ---
    console.log(`apiRequest to ${url}: Using CSRF Token: ${csrfToken}`); // <-- This is the added line
    // ---------------------------

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': csrfToken, // Use the fetched token
        ...options.headers,
    };
    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include' // IMPORTANT: Send cookies
        });

        // Handle No Content response
        if (response.status === 204) { return null; }

        // Try to parse JSON, default to null if body is empty or not JSON
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            let errorMessage = `HTTP error! Status: ${response.status}`;
            if (data) {
                // Extract specific error messages from DRF responses
                if (data.detail) { errorMessage = data.detail; }
                else if (data.non_field_errors) { errorMessage = data.non_field_errors.join(', '); }
                else if (typeof data === 'object') { // Handle field-specific validation errors
                    errorMessage = Object.entries(data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('; ');
                }
            }
            console.error("API Error Data:", data); // Log the raw error data

            // Handle Authentication/Authorization errors by redirecting
            if (response.status === 401 || response.status === 403) {
                 const redirectMessage = `Authentication required or session expired. Redirecting to login... (Server Error: ${errorMessage})`;
                 console.error(redirectMessage);
                 // Use the global alert area if available, otherwise just log
                 const globalAlertArea = document.getElementById('global-alert-area');
                 if (globalAlertArea) {
                     showAlert(redirectMessage, 'warning', globalAlertArea);
                 }
                 // Redirect after a short delay to allow user to see message
                 setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                 throw new Error(redirectMessage); // Stop further execution
            }
            // For other errors, just throw the extracted message
            throw new Error(errorMessage);
        }
        return data; // Return successful data
    } catch (error) {
        console.error('API Request Error:', error);
        // Avoid showing duplicate alerts if it's an auth error already handled
        if (!(error.message.includes('Authentication required') || error.message.includes('session expired'))) {
            const globalAlertArea = document.getElementById('global-alert-area');
             if (globalAlertArea) {
                showAlert(`API Request Failed: ${error.message || 'Unknown error'}`, 'danger', globalAlertArea);
             }
        }
        throw error; // Re-throw the error for calling function to handle if needed
    }
}


// --- Page Specific Logic ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing Afiya System JS...");

    // --- Common DOM References (Might be null depending on page) ---
    const globalAlertArea = document.getElementById('global-alert-area');

    // --- Login Page Specific ---
    const loginForm = document.getElementById('login-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginStatus = document.getElementById('login-status');
    const loginSubmitBtn = document.getElementById('login-submit-btn');

    // --- Registration Page Specific ---
    const registerForm = document.getElementById('doctor-register-form');
    const registerUsernameInput = document.getElementById('register-username');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerFirstNameInput = document.getElementById('register-first-name');
    const registerLastNameInput = document.getElementById('register-last-name');
    const registerStatus = document.getElementById('register-status');
    const registerSubmitBtn = document.getElementById('register-submit-btn');

    // --- Index Page Specific ---
    const mainAppArea = document.getElementById('main-app-area');
    const logoutBtn = document.getElementById('logout-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    // Programs
    const programListEl = document.getElementById('program-list');
    const programLoadingIndicator = document.querySelector('#program-list-container .loading');
    const createProgramForm = document.getElementById('create-program-form');
    const programNameInputModal = document.getElementById('program-name-modal');
    const createProgramStatus = document.getElementById('create-program-status');
    const createProgramSubmitBtn = document.getElementById('create-program-submit-btn');
    const createProgramModalEl = document.getElementById('createProgramModal');
    const createProgramModal = createProgramModalEl ? bootstrap.Modal.getOrCreateInstance(createProgramModalEl) : null;
    // Clients - General
    const clientListEl = document.getElementById('client-list');
    const clientLoadingIndicator = document.querySelector('#client-list-container .loading');
    // Clients - Search
    const searchClientForm = document.getElementById('search-client-form');
    const searchQueryInput = document.getElementById('search-query');
    const searchStatus = document.getElementById('search-status');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchSubmitBtn = document.getElementById('search-submit-btn');
    // Clients - Register
    const registerClientForm = document.getElementById('register-client-form');
    const clientNameInputModal = document.getElementById('client-name-modal');
    const clientDobInputModal = document.getElementById('client-dob-modal');
    const clientContactInputModal = document.getElementById('client-contact-modal');
    const registerClientStatus = document.getElementById('register-client-status');
    const registerClientSubmitBtn = document.getElementById('register-client-submit-btn');
    const registerClientModalEl = document.getElementById('registerClientModal');
    const registerClientModal = registerClientModalEl ? bootstrap.Modal.getOrCreateInstance(registerClientModalEl) : null;
    // Clients - Edit
    const editClientModalEl = document.getElementById('editClientModal');
    const editClientModal = editClientModalEl ? bootstrap.Modal.getOrCreateInstance(editClientModalEl) : null;
    const editClientForm = document.getElementById('edit-client-form');
    const editClientIdInput = document.getElementById('edit-client-id');
    const editClientNameInputModal = document.getElementById('edit-client-name-modal');
    const editClientDobInputModal = document.getElementById('edit-client-dob-modal');
    const editClientContactInputModal = document.getElementById('edit-client-contact-modal');
    const editClientStatus = document.getElementById('edit-client-status');
    const editClientSubmitBtn = document.getElementById('edit-client-submit-btn');
    // Clients - Detail/Enroll
    const clientDetailSection = document.getElementById('client-detail-section');
    const detailClientName = document.getElementById('detail-client-name');
    const detailClientDob = document.getElementById('detail-client-dob');
    const detailClientContact = document.getElementById('detail-client-contact');
    const detailClientId = document.getElementById('detail-client-id');
    const enrolledProgramsList = document.getElementById('enrolled-programs-list');
    const noEnrolledProgramsMsg = document.getElementById('no-enrolled-programs');
    const enrollClientForm = document.getElementById('enroll-client-form');
    const programSelect = document.getElementById('program-select');
    const enrollStatus = document.getElementById('enroll-status');
    const enrollSubmitBtn = document.getElementById('enroll-submit-btn');
    const closeDetailBtn = document.getElementById('close-detail-btn');

    let currentClientId = null; // State for index page

    // --- Login Handler ---
    async function handleLogin(event) {
        event.preventDefault();
        setButtonLoading(loginSubmitBtn, true);
        showFormStatus(loginStatus, 'Logging in...', true);

        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;

        try {
            // Use the URL provided by rest_framework.urls
            const response = await fetch(`${API_BASE_URL}/api-auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Required for POST
                },
                body: JSON.stringify({ username: username, password: password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `Login failed with status: ${response.status}` }));
                throw new Error(errorData.non_field_errors ? errorData.non_field_errors.join(', ') : (errorData.detail || 'Invalid credentials'));
            }

            // Login successful! Browser now has the session cookie.
            // Redirect to the main application page.
            localStorage.setItem('userData', JSON.stringify({ name: 'Juma' }));
            window.location.href = 'index.html'; // Redirect to your main app page

        } catch (error) {
            console.error('Login Error:', error);
            showFormStatus(loginStatus, `Login failed: ${error.message}`, false);
            setButtonLoading(loginSubmitBtn, false); // Re-enable button on error
        }
        // No finally block needed here for button state if redirecting on success
    }


    // --- Registration Handler ---
    async function handleRegistration(event) {
        event.preventDefault();
        setButtonLoading(registerSubmitBtn, true);
        showFormStatus(registerStatus, 'Registering...', true, 0); // Show indefinitely

        const username = registerUsernameInput.value;
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const firstName = registerFirstNameInput.value;
        const lastName = registerLastNameInput.value;

        try {
            // Assuming your backend endpoint for doctor registration is correct
            const response = await fetch(`${API_BASE_URL}/afiya/doctors/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                // Ensure backend expects these field names (e.g., first_name, last_name)
                body: JSON.stringify({ username, email, password, first_name: firstName, last_name: lastName })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `Registration failed with status: ${response.status}` }));
                // Extract detailed errors if available
                let errorMessage = errorData.detail || 'Registration failed';
                 if (errorData.non_field_errors) { errorMessage = errorData.non_field_errors.join(', '); }
                 else if (typeof errorData === 'object') {
                     errorMessage = Object.entries(errorData)
                         .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                         .join('; ');
                 }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            // Use the success message from the backend if provided, otherwise a default
            showFormStatus(registerStatus, data.message || 'Registration successful! Redirecting to login...', true, 0);
            // Redirect to the login page after a short delay
            setTimeout(() => {
               window.location.href = 'login.html';
            }, 2000); // 2 seconds delay

        } catch (error) {
            console.error('Registration Error:', error);
            showFormStatus(registerStatus, `Registration failed: ${error.message}`, false);
            setButtonLoading(registerSubmitBtn, false); // Re-enable button only on error
        }
        // No finally block needed for button if redirecting on success
    }

    // --- Program Functions (Index Page) ---
    async function fetchPrograms(populateSelect = false) {
        if (!programListEl || !programLoadingIndicator) return; // Only run on index page

        showLoadingIndicator(programLoadingIndicator);
        programListEl.innerHTML = '';
        if (populateSelect && programSelect) {
            programSelect.innerHTML = '<option value="" disabled>Loading programs...</option>';
            programSelect.disabled = true;
        }

        try {
            const programs = await apiRequest(`${API_BASE_URL}/afiya/programs/`);
            hideLoadingIndicator(programLoadingIndicator);

            if (!programs || programs.length === 0) {
                programListEl.innerHTML = '<li class="list-group-item text-muted">No programs found.</li>';
                if (populateSelect && programSelect) {
                    programSelect.innerHTML = '<option value="" disabled>No programs available</option>';
                }
            } else {
                if (populateSelect && programSelect) {
                    programSelect.innerHTML = '<option value="" disabled selected>Select a program</option>'; // Add placeholder
                }
                programs.forEach(program => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item list-group-item-action';
                    listItem.textContent = program.name;
                    listItem.dataset.programId = program.id;
                    // Add click listener or other actions if needed
                    programListEl.appendChild(listItem);

                    if (populateSelect && programSelect) {
                         const option = document.createElement('option');
                         option.value = program.id;
                         option.textContent = program.name;
                         programSelect.appendChild(option);
                    }
                });
                 if (populateSelect && programSelect) {
                    programSelect.disabled = false;
                 }
            }
        } catch (error) {
            // Error handling (like redirect) is likely done in apiRequest
            hideLoadingIndicator(programLoadingIndicator);
            if (programListEl) programListEl.innerHTML = '<li class="list-group-item text-danger">Error loading programs.</li>';
            if (populateSelect && programSelect) {
                programSelect.innerHTML = '<option value="" disabled>Error loading programs</option>';
            }
        }
    }

    async function createProgram(event) {
        event.preventDefault();
        if (!createProgramSubmitBtn || !createProgramStatus || !programNameInputModal || !createProgramForm || !createProgramModal) return;

        setButtonLoading(createProgramSubmitBtn, true);
        createProgramStatus.textContent = ''; // Clear previous status

        const programName = programNameInputModal.value.trim();
        if (!programName) {
            showFormStatus(createProgramStatus, 'Program name cannot be empty.', false);
            setButtonLoading(createProgramSubmitBtn, false);
            return;
        }

        try {
            const result = await apiRequest(`${API_BASE_URL}/afiya/programs/`, {
                method: 'POST',
                body: JSON.stringify({ name: programName })
            });
            showAlert(`Program "${result.name}" created successfully!`, 'success', globalAlertArea);
            createProgramForm.reset();
            createProgramModal.hide();
            fetchPrograms(true); // Refresh program list and select dropdown
        } catch (error) {
             // Show error within the modal
             showFormStatus(createProgramStatus, `Error: ${error.message}`, false);
        } finally {
             setButtonLoading(createProgramSubmitBtn, false);
        }
    }

    // --- Client Functions (Index Page) ---
    async function fetchClients(url = `${API_BASE_URL}/afiya/clients/`) {
        if (!clientListEl || !clientLoadingIndicator) return; // Only run on index page

        showLoadingIndicator(clientLoadingIndicator);
        clientListEl.innerHTML = '';
        hideClientDetail(); // Hide detail view when refreshing list

        try {
            const clients = await apiRequest(url);
            hideLoadingIndicator(clientLoadingIndicator);

            if (!clients || clients.length === 0) {
                clientListEl.innerHTML = '<li class="list-group-item text-muted">No clients found.</li>';
            } else {
                clients.forEach(client => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                    listItem.dataset.clientId = client.id;

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = client.name;
                    nameSpan.style.cursor = 'pointer';
                    // Add click listener to the name to show details
                    nameSpan.addEventListener('click', () => showClientDetail(client.id));
                    listItem.appendChild(nameSpan);

                    // Button group for actions
                    const buttonGroup = document.createElement('div');
                    buttonGroup.className = 'd-flex gap-1'; // Use gap for spacing

                    // View Button
                    const viewButton = document.createElement('button');
                    viewButton.className = 'btn btn-sm btn-outline-primary';
                    viewButton.innerHTML = '<i class="bi bi-eye"></i>';
                    viewButton.title = 'View Client Profile';
                    viewButton.onclick = (e) => { e.stopPropagation(); showClientDetail(client.id); }; // Prevent li click, show detail
                    buttonGroup.appendChild(viewButton);

                    // Edit Button
                    const editButton = document.createElement('button');
                    editButton.className = 'btn btn-sm btn-outline-warning';
                    editButton.innerHTML = '<i class="bi bi-pencil-square"></i>';
                    editButton.title = 'Edit Client';
                    editButton.onclick = (e) => { e.stopPropagation(); openEditClientModal(client.id); }; // Prevent li click, open edit modal
                    buttonGroup.appendChild(editButton);

                    listItem.appendChild(buttonGroup);
                    clientListEl.appendChild(listItem);
                });
            }
        } catch (error) {
            // Error handling (like redirect) is likely done in apiRequest
            hideLoadingIndicator(clientLoadingIndicator);
            if (clientListEl) clientListEl.innerHTML = '<li class="list-group-item text-danger">Error loading clients.</li>';
        }
    }

    async function openEditClientModal(clientId) {
        if (!editClientForm || !editClientStatus || !editClientIdInput || !editClientNameInputModal || !editClientDobInputModal || !editClientContactInputModal || !editClientModal) return;

        editClientForm.reset();
        editClientStatus.textContent = '';
        editClientStatus.className = 'mt-2 hidden'; // Hide status initially
        editClientIdInput.value = ''; // Clear previous ID

        try {
            // Fetch the specific client's data to pre-fill the form
            const client = await apiRequest(`${API_BASE_URL}/afiya/clients/${clientId}/`);
            editClientIdInput.value = client.id;
            editClientNameInputModal.value = client.name;
            editClientDobInputModal.value = client.date_of_birth; // Assumes YYYY-MM-DD format
            editClientContactInputModal.value = client.contact_info || ''; // Handle potentially null contact info
            editClientModal.show();
        } catch (error) {
            showAlert(`Failed to load client data for editing: ${error.message}`, 'danger', globalAlertArea);
        }
    }

    async function editClient(event) {
        event.preventDefault();
         if (!editClientSubmitBtn || !editClientStatus || !editClientIdInput || !editClientNameInputModal || !editClientDobInputModal || !editClientContactInputModal || !editClientModal) return;

        setButtonLoading(editClientSubmitBtn, true);
        editClientStatus.textContent = ''; // Clear previous status

        const clientId = editClientIdInput.value;
        if (!clientId) {
            showFormStatus(editClientStatus, 'Client ID is missing. Cannot update.', false);
            setButtonLoading(editClientSubmitBtn, false);
            return;
        }

        const clientData = {
            name: editClientNameInputModal.value.trim(),
            date_of_birth: editClientDobInputModal.value,
            contact_info: editClientContactInputModal.value.trim() || null // Send null if empty
        };

        // Basic validation
        if (!clientData.name || !clientData.date_of_birth) {
            showFormStatus(editClientStatus, 'Name and Date of Birth are required.', false);
            setButtonLoading(editClientSubmitBtn, false);
            return;
        }

        try {
            const result = await apiRequest(`${API_BASE_URL}/afiya/clients/${clientId}/`, {
                method: 'PATCH', // Use PATCH for partial updates
                body: JSON.stringify(clientData)
            });
            showAlert(`Client "${result.name}" updated successfully!`, 'success', globalAlertArea);
            editClientModal.hide();
            fetchClients(); // Refresh the client list
            // If the edited client was the one being viewed, refresh the detail view
            if (currentClientId == clientId) {
                showClientDetail(clientId);
            }
        } catch (error) {
             // Show error within the modal
             showFormStatus(editClientStatus, `Error updating client: ${error.message}`, false);
        } finally {
             setButtonLoading(editClientSubmitBtn, false);
        }
    }

    async function searchClients(event) {
        event.preventDefault();
        if (!searchSubmitBtn || !searchQueryInput || !searchStatus) return;

        setButtonLoading(searchSubmitBtn, true);
        const query = searchQueryInput.value.trim();
        searchStatus.textContent = 'Searching...';
        searchStatus.classList.remove('hidden');

        if (!query) {
             // If query is empty, fetch all clients
             await fetchClients();
             searchStatus.textContent = 'Showing all clients.';
             setButtonLoading(searchSubmitBtn, false);
             return;
        }

        // Construct the search URL
        const searchUrl = `${API_BASE_URL}/afiya/clients/search/?q=${encodeURIComponent(query)}`;
        await fetchClients(searchUrl); // Fetch clients using the search URL
        searchStatus.textContent = `Showing results for "${query}"`;
        setButtonLoading(searchSubmitBtn, false);
    }

    function clearSearch() {
        if (!searchQueryInput || !searchStatus) return;
        searchQueryInput.value = '';
        searchStatus.textContent = '';
        searchStatus.classList.add('hidden');
        fetchClients(); // Fetch all clients again
    }

    async function registerClient(event) {
        event.preventDefault();
        if (!registerClientSubmitBtn || !registerClientStatus || !clientNameInputModal || !clientDobInputModal || !clientContactInputModal || !registerClientForm || !registerClientModal) return;

        setButtonLoading(registerClientSubmitBtn, true);
        registerClientStatus.textContent = ''; // Clear previous status

        const clientData = {
            name: clientNameInputModal.value.trim(),
            date_of_birth: clientDobInputModal.value,
            contact_info: clientContactInputModal.value.trim() || null // Send null if empty
        };

        // Basic validation
        if (!clientData.name || !clientData.date_of_birth) {
            showFormStatus(registerClientStatus, 'Name and Date of Birth are required.', false);
            setButtonLoading(registerClientSubmitBtn, false);
            return;
        }

        try {
            const result = await apiRequest(`${API_BASE_URL}/afiya/clients/`, {
                method: 'POST',
                body: JSON.stringify(clientData)
            });
            showAlert(`Client "${result.name}" registered successfully!`, 'success', globalAlertArea);
            registerClientForm.reset();
            registerClientModal.hide();
            fetchClients(); // Refresh the client list
        } catch (error) {
             // Show error within the modal
             showFormStatus(registerClientStatus, `Error: ${error.message}`, false);
        } finally {
             setButtonLoading(registerClientSubmitBtn, false);
        }
    }

    async function showClientDetail(clientId) {
        if (!clientDetailSection || !detailClientName || !detailClientDob || !detailClientContact || !detailClientId || !enrolledProgramsList || !noEnrolledProgramsMsg || !enrollStatus) return;

        clientDetailSection.classList.remove('hidden');
        // Scroll into view smoothly
        clientDetailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Set loading states
        detailClientName.textContent = 'Loading...';
        detailClientDob.textContent = '...';
        detailClientContact.textContent = '...';
        detailClientId.textContent = '...';
        enrolledProgramsList.innerHTML = '<li class="list-group-item text-muted">Loading...</li>';
        noEnrolledProgramsMsg.classList.add('hidden');
        enrollStatus.textContent = '';
        enrollStatus.className = 'mt-2 hidden'; // Hide status initially
        currentClientId = clientId; // Store the currently viewed client ID

        try {
            // Fetch client details and programs for the dropdown concurrently
            const [client, _] = await Promise.all([
                apiRequest(`${API_BASE_URL}/afiya/clients/${clientId}/`),
                fetchPrograms(true) // Fetch programs and populate the select dropdown
            ]);

            // Populate client details
            detailClientName.textContent = client.name;
            detailClientDob.textContent = client.date_of_birth;
            detailClientContact.textContent = client.contact_info || 'N/A';
            detailClientId.textContent = client.id;

            // Populate enrolled programs list
            updateEnrolledProgramsDisplay(client.enrolled_programs);

        } catch (error) {
             // Error handling (like redirect) is likely done in apiRequest
             detailClientName.textContent = 'Error loading details';
             // If it wasn't an auth error that caused a redirect, hide the section
             if (!(error.message.includes('Authentication required') || error.message.includes('session expired'))) {
                hideClientDetail();
             }
        }
    }

    function updateEnrolledProgramsDisplay(enrolledPrograms) {
        if (!enrolledProgramsList || !noEnrolledProgramsMsg) return;

        enrolledProgramsList.innerHTML = ''; // Clear existing list
        if (enrolledPrograms && enrolledPrograms.length > 0) {
            enrolledPrograms.forEach(program => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.textContent = `${program.name}`; // Assuming program object has a 'name'
                // Add unenroll button or other actions if needed
                enrolledProgramsList.appendChild(listItem);
            });
            noEnrolledProgramsMsg.classList.add('hidden');
        } else {
            // Show message if no programs are enrolled
            noEnrolledProgramsMsg.classList.remove('hidden');
            enrolledProgramsList.innerHTML = ''; // Ensure list is empty
        }
    }


    function hideClientDetail() {
        if (!clientDetailSection) return;
        clientDetailSection.classList.add('hidden');
        currentClientId = null; // Reset current client ID
    }

    async function enrollClient(event) {
        event.preventDefault();
        if (!currentClientId || !enrollSubmitBtn || !enrollStatus || !programSelect) return;

        setButtonLoading(enrollSubmitBtn, true);
        enrollStatus.textContent = ''; // Clear previous status

        const programId = programSelect.value;
        if (!programId) {
            showFormStatus(enrollStatus, 'Please select a program to enroll.', false);
            setButtonLoading(enrollSubmitBtn, false);
            return;
        }

        try {
            // API endpoint likely expects client ID in URL and program ID in body
            const result = await apiRequest(`${API_BASE_URL}/afiya/clients/${currentClientId}/enroll/`, {
                method: 'POST',
                body: JSON.stringify({ program_id: parseInt(programId) }) // Ensure program_id is an integer
            });
            // Find the name of the enrolled program from the result (assuming backend returns updated client)
            const enrolledProgramName = result.enrolled_programs?.find(p => p.id == programId)?.name || 'program';
            // Use showFormStatus with auto-hide for success message
            showFormStatus(enrollStatus, `Successfully enrolled in ${enrolledProgramName}!`, true, 5000);
            // Refresh the displayed list of enrolled programs
            updateEnrolledProgramsDisplay(result.enrolled_programs);

        } catch (error) {
             showFormStatus(enrollStatus, `Error enrolling: ${error.message}`, false);
        } finally {
             setButtonLoading(enrollSubmitBtn, false);
        }
    }

    // --- Logout Function (Index Page) ---
    async function handleLogout() {
        if (!logoutBtn) return;

        // Provide visual feedback during logout
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging out...';

        try {
            // Send POST request to Django's logout view
            // IMPORTANT: Await the fetch call to ensure it completes before redirecting
            const response = await fetch(`${API_BASE_URL}/api-auth/logout/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }, // CSRF token needed for POST
                credentials: 'include' // Send cookies
            });

            if (!response.ok) {
                // Log error but still attempt redirect
                console.error(`Logout request failed with status: ${response.status}`);
                // Use the global alert area if available
                const globalAlertArea = document.getElementById('global-alert-area');
                if (globalAlertArea) {
                   showAlert(`Logout request failed (status ${response.status}), but redirecting anyway.`, 'warning', globalAlertArea);
                }
            }
            // Redirect to login page AFTER the logout request completes (successfully or not)
            window.location.href = 'login.html';

        } catch (error) {
            console.error('Logout Error:', error);
            // Use the global alert area if available
            const globalAlertArea = document.getElementById('global-alert-area');
            if (globalAlertArea) {
               showAlert(`Logout failed: ${error.message}. Redirecting to login.`, 'danger', globalAlertArea);
            }
            // Still redirect even on network error
            window.location.href = 'login.html';
        }
        // No need to manually re-enable the button here as we are redirecting away
    }

    // --- Authentication Check Function (Index Page) ---
    async function checkAuthentication() {
         console.log("Checking authentication...");
         try {
             // Attempt to fetch a protected resource. apiRequest handles 401/403 redirect.
             // Fetching user details might be better than programs if available
             // Example: const user = await apiRequest(`${API_BASE_URL}/api/user/profile/`);
             // For now, using programs as the check:
             await apiRequest(`${API_BASE_URL}/afiya/programs/`);

             console.log("Authentication successful. Loading app data.");
             // Set welcome message (could fetch actual username later if API provides it)
             if (welcomeMessage) {
                const userData = JSON.parse(localStorage.getItem('userData')) || {};
                welcomeMessage.textContent = `Welcome, ${userData.name || 'Doctor'}!`;
            }
             // Load initial data for the index page
             fetchPrograms(true); // Fetch programs and populate dropdown
             fetchClients();     // Fetch clients

         } catch (error) {
             // Error handling (including redirect) is done within apiRequest
             console.error("Initial authentication check failed or caused redirect:", error.message);
             // No further action needed here as apiRequest handles the redirect flow
         }
     }

    // --- Event Listener Setup ---

    // Login Page
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log("Login form listeners attached.");
    }

    // Registration Page
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        console.log("Registration form listeners attached.");
    }

    // Index Page (Main App)
    if (mainAppArea) {
        console.log("Initializing Index Page listeners...");
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (createProgramForm) createProgramForm.addEventListener('submit', createProgram);
        if (searchClientForm) searchClientForm.addEventListener('submit', searchClients);
        if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
        if (registerClientForm) registerClientForm.addEventListener('submit', registerClient);
        if (closeDetailBtn) closeDetailBtn.addEventListener('click', hideClientDetail);
        if (enrollClientForm) enrollClientForm.addEventListener('submit', enrollClient);
        if (editClientForm) editClientForm.addEventListener('submit', editClient);

        // Modal cleanup listeners (optional but good practice)
        if (createProgramModalEl) {
            createProgramModalEl.addEventListener('hidden.bs.modal', () => {
                createProgramStatus?.classList.add('hidden');
                createProgramStatus.textContent = '';
                createProgramForm?.reset();
            });
        }
        if (registerClientModalEl) {
            registerClientModalEl.addEventListener('hidden.bs.modal', () => {
                registerClientStatus?.classList.add('hidden');
                registerClientStatus.textContent = '';
                registerClientForm?.reset();
            });
        }
         if (editClientModalEl) {
            editClientModalEl.addEventListener('hidden.bs.modal', () => {
                editClientStatus?.classList.add('hidden');
                editClientStatus.textContent = '';
                editClientForm?.reset();
            });
        }

        // --- Initial Action for Index Page: Check Authentication ---
        checkAuthentication();
    } else {
        console.log("Not on Index page, skipping main app initialization.");
    }

}); // End DOMContentLoaded
