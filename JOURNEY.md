## Project Journey & Design Decisions

This project was built incrementally, following a phase-based backend roadmap.

### Phase 1 – Authentication & Roles
Implemented JWT-based authentication with role-based access (admin, teacher, student).
Focus was on securing routes early and avoiding auth changes later.

### Phase 2 – Class Management
Designed a Class entity owned by teachers.
Key decisions:
- Students join classes using a join code
- Ownership checks enforced at controller level
- Role-based routes separated for clarity

### Phase 3 – Attendance System (In Progress)
Attendance is modeled per lecture instead of per day to support:
- Multiple lectures per day
- Time-bound attendance windows
- Spreadsheet-style attendance export

A separate Lecture entity was introduced to represent each attendance session.
