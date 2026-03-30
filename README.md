# Leave Management System

A robust and professional Leave Management System built with React.js, MobX, and the Context API. This project provides a clean, role-based interface for employees, managers, and administrators to manage time-off requests efficiently.

## Project Vision

This application aims to provide a minimalist and professional user experience for IT companies. We avoided over-the-top animations or flashy emojis in favor of a clean, geometric design system that emphasizes clarity and productivity.

## Key Features

### Employee Portal
- **Dashboard & Balance:** Track your 24-day annual leave balance.
- **Application Form:** Apply for leave using a simple, validated form.
- **History:** View your previous leave requests and their current approval status (Pending, Approved, or Rejected).

### Manager Portal
- **Team Overview:** View all leave applications from your team.
- **Filtered Requests:** Filter requests by employee name or approval status via URL parameters for easy bookmarking.
- **One-Click Approval:** Approve or reject requests directly from the table with visual feedback.

### Administrator Dashboard
- **System Analytics:** High-level overview of total, pending, and rejected leaves.
- **Data Visualization:** Distribution of leave requests by employee shown via a clean, corporate-style bar chart.

---

## Technical Stack

- **Frontend:** React (Class Components)
- **State Management:** MobX & React Context API
- **Routing:** React Router v6
- **Mock Backend:** JSON Server
- **Styling:** Vanilla CSS (Inline) - Completely framework-free for maximum customization.

---

## Getting Started

Follow these steps to set up the project on your local machine.

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (Node Package Manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/leave-management-system.git
   cd leave-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Mock Server:**
   In a separate terminal window, start the JSON server to handle data persistence:
   ```bash
   npx json-server --watch db.json --port 5000
   ```

4. **Start the Application:**
   Go back to your main terminal and run:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

---

## Demo Credentials

You can use the following accounts to explore different roles:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin@123` |
| **Manager** | `manager` | `manager@123` |
| **Employee** | Employee Name | `123456` |

*Note: For the Employee role, the system will automatically create a new user profile if the name doesn't exist yet.*

---

## Project Assumptions & Limitations

- **Mock Validation:** The "Server Time" validation is mocked using a fixed endpoint.
- **Persistence:** Data is persisted in `db.json` via the JSON server. If the server is restarted without saving the file, data remains.
- **Mobile Support:** The UI uses responsive design principles (Flexbox/Grid) to ensure functionality on various screen sizes.
- **Security:** This is a prototype; authentication is simulated for demonstration purposes.

---

## Implementation Notes

- **No Hooks Policy:** All components are written using the React Class Component architecture as per the technical requirements.
- **Zero Framework Styling:** No Tailwind or Bootstrap was used. All styles are custom-crafted inline or in `index.css`.
- **State Management:** MobX provides a reactive state that syncs across the application without complex boilerplate.
