NOTE: POWERPOINT PRESENTATION LINK :  https://drive.google.com/file/d/1uyhryXBpatV1qiZAKh_gtqGcgCCJP5v_/view?usp=sharing

LIVE DEMO LINK :  https://juma-afiya-system.onrender.com/

**Important Note for Live Demo Users:** While you can register a new doctor account on the live demo, newly registered accounts **cannot log in immediately**. Access to the dashboard and program features requires an authentication token that must be provided by the system administrator after registration. This is a security measure for the demo environment.

# Afiya-System

A basic health information system simulation allowing doctors to manage clients and health programs (like TB, HIV). Features include client registration, program enrollment, search, and profile viewing via a simple web interface and API.

## Features

*   Doctor Registration & Login (Token-based API)
*   ![Afiya](https://github.com/user-attachments/assets/3b0ea4d7-0e33-4b32-927a-653a1bb29327)

*   Client Registration & Management (Name, DOB, Contact)
*   ![Afiya_Regiater_Client](https://github.com/user-attachments/assets/9d958781-3451-4980-a54d-1a77fd0dc567)

*   Health Program Creation & Listing
*   ![Afiya_Create_Program](https://github.com/user-attachments/assets/0fd28078-9271-47eb-ba54-27cd850285ac)

*   Client Enrollment in Programs
*   ![Afiya_Client_Profile](https://github.com/user-attachments/assets/7bebce3c-6342-42ec-a7c3-e414aedb9dd0)

*   Client Search Functionality
*   ![Screenshot from 2025-04-28 11-40-15](https://github.com/user-attachments/assets/6d90ae4c-406c-4b6a-badd-68e1ed4cdb4e)

*   Client Profile Viewing (including enrolled programs)
*   REST API for Client and Program data:
  Base URL: https://juma-afiya-system.onrender.com

Program Endpoints:

GET /afiya/programs/
Action: List all available programs.
Used in: fetchPrograms, checkAuthentication
POST /afiya/programs/
Action: Create a new program.
Used in: createProgram
Request Body Example: { "name": "New Program Name" }
Client Endpoints:

GET /afiya/clients/
Action: List all clients.
Used in: fetchClients (when no search query)
POST /afiya/clients/
Action: Create (register) a new client.
Used in: registerClient
Request Body Example: { "name": "Client Name", "date_of_birth": "YYYY-MM-DD", "contact_info": "Optional Contact" }
GET /afiya/clients/search/?q=<query>
Action: Search for clients based on the provided query parameter q.
Used in: searchClients
GET /afiya/clients/{client_id}/
Action: Retrieve the details of a specific client.
Used in: openEditClientModal, showClientDetail
PATCH /afiya/clients/{client_id}/
Action: Partially update the details of a specific client.
Used in: editClient
Request Body Example: { "name": "Updated Name", "date_of_birth": "YYYY-MM-DD", "contact_info": "Updated Contact" } (any subset of fields)
POST /afiya/clients/{client_id}/enroll/
Action: Enroll a specific client into a program.
Used in: enrollClient
Request Body Example: { "program_id": 123 }

## Setup Instructions

Follow these steps to get the Afiya System running on your local machine.

**1. Prerequisites:**

*   **Python:** Ensure you have Python 3.8 or higher installed. You can download it from [python.org](https://www.python.org/).
*   **pip:** Python's package installer. It usually comes with Python. Make sure it's up to date (`python -m pip install --upgrade pip`).
*   **Git:** Required to clone the repository. Download from git-scm.com.
*   **(Optional) Virtual Environment Tool:** `venv` (built-in) or `virtualenv` (`pip install virtualenv`).

**2. Clone the Repository:**

Open your terminal or command prompt and clone the project:

```bash
git clone <your-repository-url> # Replace <your-repository-url> with the actual URL
cd Afiya-System # Or your project's root directory name

3. Create and Activate a Virtual Environment:

It's highly recommended to use a virtual environment to keep project dependencies isolated.

Using venv (Recommended):

bash
# Create the environment (e.g., named 'venv')
python -m venv venv

# Activate the environment:
# On Windows (cmd.exe):
venv\Scripts\activate.bat
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux (bash/zsh):
source venv/bin/activate
You should see (venv) prepended to your terminal prompt.

Using virtualenv (Alternative):

bash
# Create the environment
virtualenv venv

# Activate (same commands as above)
4. Install Dependencies:

Install all the required Python packages listed in the requirements.txt file:

bash
pip install -r requirements.txt
(Note: If a requirements.txt file doesn't exist yet, you might need to create one based on the project's imports or install Django and DRF manually: pip install django djangorestframework)

5. Apply Database Migrations:

Django uses migrations to set up and update the database schema. Run the following command:

bash
python manage.py migrate
This will create the necessary database tables (using the default db.sqlite3 file unless configured otherwise).

6. Create a Superuser (Admin):

To access the Django admin interface (optional but useful), create a superuser:

bash
python manage.py createsuperuser
Follow the prompts to set a username, email (optional), and password.

7. Run the Development Server:

Start the Django development server:

bash
python manage.py runserver
By default, the server will run at http://127.0.0.1:8000/.

8. Access the Application:

Web Interface: Open your web browser and navigate to:
http://127.0.0.1:8000/ (or the specific URL for the main frontend page, e.g., index.html if served statically)
http://127.0.0.1:8000/admin/ (to access the Django admin panel using your superuser credentials)
API Endpoints: You can access the API endpoints using tools like curl, Postman, or directly in the browser (for GET requests):
http://127.0.0.1:8000/afiya/login/ (POST for login)
http://127.0.0.1:8000/afiya/doctors/register/ (POST for registration)
http://127.0.0.1:8000/afiya/programs/ (GET, POST)
http://127.0.0.1:8000/afiya/clients/ (GET, POST)
http://127.0.0.1:8000/afiya/clients/<id>/ (GET, PUT, PATCH, DELETE)
http://127.0.0.1:8000/afiya/clients/<id>/enroll/ (POST)
http://127.0.0.1:8000/afiya/clients/search/?q=<query> (GET)
(Optional) 9. Run Tests:

If the project includes tests, you can run them using:

bash
python manage.py test
You should now have the Afiya System running locally!
