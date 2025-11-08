Frontend refactor notes

- Removed Jinja base.html usage and converted all templates (index.html, login.html, signup.html, doctor.html, patient.html, chat.html) into standalone static HTML that load style.css and main.js directly.
- Centralized all backend calls in main.js via the `api` object, pointing at the Render backend: https://shs-backend-ktg8.onrender.com
  Endpoints referenced:
  - POST /login
  - POST /signup/<role>
  - GET /logout
  - GET /api/me (expected)
  - GET /api/my_chats (expected for doctor chat list)
  - GET /api/doctors (expected for patient doctor list)
  - GET /api/messages/<chat_id>?after=<iso>
  - POST /api/send
  - GET /api/chat_init/<other_id> (creates/returns chat metadata)
  - POST /api/ai

If any of the expected endpoints are not present in your backend, either add them or extend the shims in main.js to source equivalent data from existing routes.
