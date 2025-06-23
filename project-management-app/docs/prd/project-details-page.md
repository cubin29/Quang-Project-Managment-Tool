# 📄 Product Requirements Document (PRD): Project Details Page

## 🧩 Overview
**Feature Name**: Project Details Page  
**Owner**: Product Team  
**Status**: MVP Scope  
**Objective**: To enable Project Managers to manage and execute individual projects at a detailed level, with task breakdown, documentation, progress tracking, and team coordination capabilities.

---

## 🎯 Goals
- Centralize all relevant project execution information.
- Break down projects into tasks with full CRUD control.
- Visualize tasks in Kanban, Table, and Gantt formats.
- Facilitate risk tracking and mitigation.
- Enhance collaboration with documentation and comment logs.

---

## ✨ Features in MVP Scope

### 1. Project Description (Free Text)
- Textarea input for brief summary.
- Editable inline.

### 2. Jira Ticket & Wiki Documentation Input
- Input fields:
  - `Jira Ticket URL`
  - `Wiki Doc URL`
- Display as clickable hyperlinks.

### 3. Task Management
#### Fields per Task:
| Field | Type | Required |
|-------|------|----------|
| Task Name | Text | ✅ |
| Milestone | Text | ⬜ |
| PIC | User Select | ✅ |
| Start Date | Date | ✅ |
| ETA | Date | ✅ |
| Priority | Dropdown (Low, Medium, High, Urgent) | ✅ |
| Status | Dropdown (To Do, In Progress, Done) | ✅ |
| Description | Textarea | ⬜ |
| Dependencies | Multi-select (Other Tasks) | ⬜ |
| Attachments | File Upload | ⬜ |
| Comments | Threaded text input | ⬜ |

#### Actions:
- Add / Edit / Delete tasks.
- Mark as complete.
- Reorder tasks by drag & drop in Kanban.

### 4. Task Display Modes
- **Kanban View** (columns by Status)
- **Table View** (with filters by PIC, Priority, Status)
- Toggle Switch: Kanban ↔ Tabular

### 5. Gantt Chart View
- Auto-generate based on `Start Date`, `ETA`.
- Show dependencies as arrows.
- Zoom & scroll controls.

### 6. Risk Management
| Field | Type |
|-------|------|
| Risk Name | Text |
| Description | Textarea |
| Severity | Dropdown (Low, Medium, High, Critical) |
| Likelihood | Dropdown (Low, Medium, High) |
| Mitigation Plan | Textarea |
| Owner | User Select |

### 7. Change Request Tracker (CR Log)
| Field | Type |
|-------|------|
| Request Title | Text |
| Description | Textarea |
| Requested By | User Select |
| Date | Date |
| Impact | Text |
| Linked Tasks | Multi-select |
| Status | Dropdown (Pending, Approved, Rejected) |

### 8. Comments & Activity Logs
- **Comments per Task**: Inline thread, @mention support.
- **Activity Logs**:
  - Track changes: Status, Due date, PIC changes.
  - Auto-generated entries with timestamp.

### 9. File Attachment
- Allow uploads on each task and at the project level.
- Show file preview, name, and version.

### ⚠️ UX Enhancements
- Filter tasks by `PIC`, `Status`, `Priority`.
- Highlight overdue tasks.
- Health Indicator Badge on Project Header (Green / Yellow / Red)
  - Based on % overdue + open risks.

---

## 🗃️ Database Design (Simplified Schema)

### Table: `projects`
```sql
id (PK)
name
status
priority
impact_score
tech_effort
project_value
revenue_uplift
hc_saving
country
pic_id (FK: users)
description
jira_url
wiki_url
start_date
end_date
created_at
updated_at
```

### Table: `tasks`
```sql
id (PK)
project_id (FK: projects)
title
description
milestone
pic_id (FK: users)
start_date
eta
priority
status
progress
created_at
updated_at
```

### Table: `task_dependencies`
```sql
id (PK)
task_id (FK: tasks)
depends_on_task_id (FK: tasks)
```

### Table: `task_comments`
```sql
id (PK)
task_id (FK: tasks)
author_id (FK: users)
comment_text
created_at
```

### Table: `task_attachments`
```sql
id (PK)
task_id (FK: tasks)
filename
file_url
uploaded_by (FK: users)
created_at
```

### Table: `project_risks`
```sql
id (PK)
project_id (FK: projects)
title
description
severity
likelihood
owner_id (FK: users)
mitigation_plan
created_at
```

### Table: `change_requests`
```sql
id (PK)
project_id (FK: projects)
title
description
requested_by (FK: users)
date
impact
status
created_at
```

### Table: `cr_task_links`
```sql
id (PK)
change_request_id (FK: change_requests)
task_id (FK: tasks)
```

---

## 📊 Analytics (Future Phase)
- % of tasks on-time vs delayed
- Risk resolution rate
- Average task completion time
- Active CRs count per project

---

## 📌 Notes
- All views must be responsive.
- All CRUD actions require optimistic UI & success/error feedback.
- Error states should be handled gracefully (e.g., empty states, load failures).

---

## 🧪 Next Steps
- Finalize data structure and sync with backend.
- Define frontend components based on views (Kanban, Gantt, Table).
- Start MVP sprint planning with dev team.

---

*End of PRD*
