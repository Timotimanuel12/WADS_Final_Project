# HelpImTooLazy.com - Study Planner and Productivity Tracker

## 1. Project Information

- **Project Title:** HelpImTooLazy
- **Project Domain:** 10. Study Planner & Productivity Tracker
- **Course:** Web Application Development and Security (COMP6703001)
- **Class:** L4BC
- **Group Members:**
- **Michael Arianno Chandrarieta** - 2802499711 - MichaelFirstAC
- **Jason Franto Fong** - 2802557781 - Jasonnnnnnn1
- **Timothy Jonathan Imannuel** - 2802521825 - Timotimanuel12

—

## 2. Instructor & Repository Access [cite_start]This repository has been shared with[cite: 1184]: _ **Instructor:** Ida Bagus Kerthyayana Manuaba (GitHub: `bagzcode`) _

**Instructor Assistant:** Juwono (GitHub: `Juwono136`)
—

## 3. Project Overview

### 3.1 Problem Statement

Students struggle to manage their study time effectively due to the lack of planning, organization, and difficulty in tracking deadlines, tasks, and progress. Most students use tools such as notebooks, calendars, or messaging apps, which are usually too inefficient. This can cause students to miss deadlines and lead to last minute studying leading to overall lower academic performance. The study planner will help by providing a way to plan study tasks, manage schedules, and monitor deadlines in a single platform.

Our target users are students whether it be in school or university who are in need to manage several courses or schedules at the same time. The system is designed in a way where it can support students with different study habits and schedules. It can also benefit self learners who want a simple and effective way to plan their study routines and improve overall productivity.

### 3.2 Solution Overview

We are developing a full-stack "Smart Study Planner" that automates the scheduling process.

- **Main Features:**
- **Smart Scheduling:** Auto-allocates tasks into free calendar slots based on priority and deadlines.
- **Focus Timer:** A built-in Pomodoro-style timer to track actual study duration.
- **Progress Dashboard:** Visual analytics of study habits and task completion rates.

- **AI Integration:**
- **AI Scheduler:** Uses an algorithm to generate optimal daily schedules, preventing overlaps and overloading.
- **Burnout Detection:** Analyzes study patterns to detect fatigue and suggest breaks or schedule adjustments.

---

## 4. Technology Stack

| Layer                | Technology            | Description                                                                       |
| -------------------- | --------------------- | --------------------------------------------------------------------------------- |
| **Frontend**         | **Next.js**           | React framework (App Router) for responsive UI and client-side rendering.         |
| **Backend**          | **Node.js (Express)** | Separate service handling business logic, AI processing, and API routes.          |
| **API**              | **RESTful API**       | Standard HTTP methods (GET, POST, PUT, DELETE) with JSON responses.               |
| **Database**         | **PostgreSQL**        | Relational database managed via **Prisma ORM** for structured task/schedule data. |
| **Auth**             | **Firebase Auth**     | Handles user identity (Google Sign-In) and token generation.                      |
| **Containerization** | **Docker**            | Dockerfiles for both Frontend and Backend; Docker Compose for orchestration.      |
| **Deployment**       | **Hosting platform**  |
| **Version Control**  | **GitHub**            | Repository with main and feature branches.                                        |

---

## 5. System Architecture

### 5.1 Architecture Diagram

    graph TD
        subgraph Client_Side ["Frontend (User's Browser)"]
            UI[Next.js React UI]
            Timer[Study Timer Component]
            Calendar[Calendar Component]
        end

        subgraph Server_Side ["Backend (Next.js API Routes)"]
            Auth[Auth Middleware (JWT)]
            TaskAPI[Task Management API]
            AnalyticsAPI[Analytics Engine]
            AI_Service[AI Prioritization Service]
        end
    
        subgraph External_Services ["Infrastructure & External"]
            DB[(PostgreSQL Database)]
            OpenAI[OpenAI GPT-4o API]
        end
    
        %% Data Flow Connections
        UI -->|HTTPS Requests| Auth
        Auth -->|Validated Request| TaskAPI
        Auth -->|Validated Request| AnalyticsAPI
    
        TaskAPI -->|CRUD Operations| DB
        AnalyticsAPI -->|Query Logs| DB
    
        TaskAPI -->|Send Task Prompt| AI_Service
        AI_Service -->|Request Priority| OpenAI
        OpenAI -->|Return JSON| AI_Service
    
        Timer -->|Sync Session Data| AnalyticsAPI

### 5.2 Architecture Explanation

The **FocusFlow** system is built on a **Client-Server Architecture** utilizing the Next.js framework to handle both the frontend interface and the backend API logic. The system follows a strict **Separation of Concerns** principle, ensuring that business logic, data access, and presentation layers are decoupled.

- **Frontend (Presentation Layer):**
  - [cite_start]Built with **Next.js (App Router)** and **React** to ensure a responsive and interactive user interface[cite: 699, 773].
  - [cite_start]Utilizes **Server-Side Rendering (SSR)** for the initial dashboard load to ensure performance and SEO, while using Client-Side Rendering (CSR) for interactive elements like the drag-and-drop calendar and study timer[cite: 702].
  - [cite_start]**Constraint:** The frontend never accesses the database directly; it strictly communicates via the REST API[cite: 723].

- **Backend & API (Application Layer):**
  - [cite_start]Implemented using **Node.js** within **Next.js API Routes**[cite: 706].
  - Acts as the secure gateway and orchestrator of the system. It processes incoming HTTP requests, enforces business rules (e.g., checking for conflicting study sessions), and manages authentication sessions.
  - **AI Service:** The backend acts as a secure proxy to the AI provider (OpenAI). It receives raw user input, constructs the prompt, sends it to the LLM, and sanitizes the JSON response before returning it to the client. This ensures API keys are never exposed to the browser.

- **Database Interaction (Data Layer):**
  - [cite_start]**PostgreSQL** is used as the primary relational database[cite: 718].
  - **Prisma ORM** is used for all database interactions. It provides type safety and prevents SQL injection by abstracting raw queries. [cite_start]We define a strict schema (`schema.prisma`) which enforces data integrity for Users, Tasks, and Study Sessions[cite: 781].

- **Security Enforcement:**
  - [cite_start]**Authentication:** Security is enforced using **JWT (JSON Web Tokens)** stored in HTTP-Only cookies to prevent XSS attacks[cite: 798].
  - **Authorization:** Middleware runs before every protected API route to verify the token signature. [cite_start]Row-Level Security logic is applied at the application layer; every database query includes a `where: { userId: currentUserId }` clause to ensure users can strictly access only their own data[cite: 782].
  - [cite_start]**Input Validation:** All incoming API payloads are validated using **Zod** schemas to reject malformed data before it reaches the database[cite: 799].

### 6. API Design (MANDATORY)

#### 6.1 API Endpoints

| Method     | Endpoint             | Description                                                | Auth Required |
| :--------- | :------------------- | :--------------------------------------------------------- | :------------ |
| **POST**   | `/api/auth/register` | Registers a new user account.                              | No            |
| **POST**   | `/api/auth/login`    | Authenticates user and returns JWT token.                  | No            |
| **GET**    | `/api/tasks`         | Retrieves all tasks for the logged-in user.                | Yes           |
| **POST**   | `/api/tasks`         | Creates a new task.                                        | Yes           |
| **PATCH**  | `/api/tasks/[id]`    | Updates a task (e.g., mark as complete).                   | Yes           |
| **DELETE** | `/api/tasks/[id]`    | Deletes a specific task.                                   | Yes           |
| **POST**   | `/api/ai/prioritize` | **AI Feature:** Analyzes task details to suggest priority. | Yes           |
| **POST**   | `/api/sessions`      | Logs a completed study session (timer data).               | Yes           |
| **GET**    | `/api/analytics`     | Retrieves productivity stats (e.g., total study hours).    | Yes           |
