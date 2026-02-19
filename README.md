#  Attendance Management System – Backend .

A secure, role-based Attendance Management System built using **Node.js, Express, MongoDB, and JWT Authentication**.

---

## 🚀 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (Cookie-based authentication)
* bcrypt
* Role-Based Middleware

---

# 🏗 System Architecture

## 📌 Core Entities

### 1️⃣ User

Single model for:

* Admin
* Teacher
* Student

Role-specific fields are conditionally required.

---

### 2️⃣ Class

* Created by a Teacher
* Contains multiple Students
* Has multiple Lectures
* Generates a `joinCode`

---

### 3️⃣ Lecture

* Belongs to a Class
* Has `startTime` and `endTime`
* Generates temporary `attendanceCode`
* Has `isActive` state

---

### 4️⃣ Attendance

Stores attendance per lecture per student:

* `lectureId`
* `studentId`
* `status` → present / absent
* `markedBy` → student / teacher

---

# 🔐 Authentication & Authorization

## Authentication

* JWT stored in cookies
* `auth` middleware verifies token
* User attached to `req.user`

## Role-Based Access

Middleware: `checkRole(role)`

Supported roles:

* admin
* teacher
* student

---

# 👥 User Management

## 🔹 Create User (Admin Only)

**Endpoint**

```
POST /admin/create-user
```

### Student Example

```json
{
  "name": "Aman",
  "phone": "9000000002",
  "applicationNumber": "S1001",
  "role": "student",
  "branch": "AIML",
  "rollNo": 61
}
```

### Teacher Example

```json
{
  "name": "Raj Sir",
  "phone": "9000000001",
  "applicationNumber": "T1001",
  "role": "teacher",
  "teacherDepartment": "AIML"
}
```

---

# 🏫 Class Module

## 🔹 Create Class (Teacher Only)

```
POST /teacher/create-class
```

### Body

```json
{
  "className": "Operating Systems",
  "department": "AIML",
  "semester": 4,
  "section": "A"
}
```

Each class:

* Generates a unique `joinCode`
* Is owned by the teacher

---

## 🔹 Student Join Class

```
POST /student/join-class/:joinCode
```

Adds student to class using join code.

---

## 🔹 Update Class

```
PUT /teacher/update-class/:classId
```

Teacher only.

---

## 🔹 Remove Class

```
DELETE /teacher/remove-class/:classId
```

Teacher only.

---

# 📚 Lecture Module

## 🔹 Create Lecture

```
POST /class/create-lecture/:classId
```

### Body

```json
{
  "startTime": "2026-02-15T23:20:00",
  "endTime": "2026-02-16T00:05:00"
}
```

### Rules

* Only teacher can create
* Time window validated
* Attendance code generated
* `isActive = true`

---

## 🔹 Get All Lectures

```
GET /class/:classId/lectures
```

Accessible by:

* Class Teacher
* Enrolled Students

---

## 🔹 Delete Lecture

```
DELETE /class/:classId/lecture/:lectureId
```

Teacher only.

---

# 📝 Attendance Module

## 🔹 Student Marks Attendance

```
POST /attendance/:lectureId
```

### Body

```json
{
  "attendanceCode": "ABC123"
}
```

### Validation Checks

* Student enrolled
* Lecture exists
* Lecture is active
* Within time window
* Code matches

---

### ⚡ Auto-Absent Logic

If no attendance record exists for a student:
→ Student is considered **Absent**

---

## 🔹 Teacher Manual Attendance

```
POST /attendance/:lectureId/manual
```

### Body

```json
{
  "absentStudentIdArray": ["studentId1", "studentId2"]
}
```

Teacher marks only absent students.

---

## 🔹 Close Lecture

```
PATCH /attendance/:lectureId/close
```

Sets:

```
isActive = false
```

---

# 📊 Attendance Sheet Generation

## 🔹 Structured Sheet Data

```
GET /attendance/sheet/:classId
```

### Response Format

```json
{
  "className": "Operating Systems",
  "headers": ["Roll No", "Name", "02 Aug", "03 Aug"],
  "rows": [
    ["AIML-61", "Aman", "P", "A"],
    ["AIML-62", "Ravi", "A", "P"]
  ]
}
```

### Sheet Logic

* Headers = Lectures sorted by `startTime`
* Rows = Students × Lectures
* Missing attendance record = Absent

---

## 🔹 CSV Export

```
GET /attendance/sheet/:classId/export
```

Downloads:

```
ClassName-attendance.csv
```

---

# 🧠 Attendance Design Principles

* Lecture-Based Attendance (not per day)
* Multiple Lectures Per Day Supported
* Auto-Absent Derived from Missing Records
* Duplicate Protection using upsert
* Ownership Validation Enforced

---

# ⚠ Error Handling

| Code | Meaning                 |
| ---- | ----------------------- |
| 400  | Bad Request             |
| 401  | Authentication Required |
| 403  | Unauthorized            |
| 404  | Not Found               |
| 409  | Conflict                |
| 500  | Server Error            |

---

# 🔒 Security Features

* JWT stored in cookies
* Role-based middleware
* Time-window validation
* Unique constraints on rollNo, phone, applicationNumber
* Ownership validation

---

# 📌 Future Improvements

* Excel (.xlsx) Export
* Attendance Percentage Column
* Date Range Filtering
* Dashboard Analytics
* Soft Delete Strategy
* Pagination Support

---

# ✅ Project Status

✔ Authentication
✔ Role-Based Access
✔ Class Management
✔ Lecture Management
✔ Attendance System
✔ Structured Sheet Generation
✔ CSV Export

---

## 🎯 Summary

This backend provides a complete lecture-based attendance management system with secure role-based access, automated attendance logic, and exportable reporting. Ready for frontend integration and further enhancement.


