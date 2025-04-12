# Kanban Todo App Tasks

## Phase 1: Project Setup & Core Infrastructure

- [x] 🔴 Initialize Next.js 14 project with TypeScript
  - Use `create-next-app`
  - Ensure basic project structure is correct.
- [x] 🔴 Configure Tailwind CSS
  - Install dependencies (`tailwindcss`, `postcss`, `autoprefixer`) - Handled by create-next-app
  - Initialize config files (`tailwind.config.ts`, `postcss.config.mjs`) - Verified & Created
  - Import base styles in `globals.css` - Verified & Corrected
- [ ] 🔴 Setup Shadcn/ui
  - Run `npx shadcn-ui@latest init`
  - Configure `components.json`
  - Install essential components (e.g., button, dialog, input)
- [x] 🔴 Setup Shadcn/ui
  - Run `npx shadcn@latest init` - Completed
  - Configure `components.json` - Created
  - Install essential components (e.g., button, dialog, input) - Will do as needed
- [x] 🟡 Setup ESLint and Prettier
  - Configure rules for code consistency. - Done (ESLint base + Prettier integration)
  - Integrate with IDE if possible. - User step (e.g., install Prettier/ESLint extensions)
- [ ] 🟡 Setup Docker Environment
  - Create `Dockerfile` for Next.js app.
  - Create `docker-compose.yml` for development service.
  - Ensure hot-reloading works within Docker.
- [x] 🟡 Setup Docker Environment
  - Create `Dockerfile` for Next.js app. - Done (Root directory)
  - Create `docker-compose.yml` for development service. - Done (Root directory)
  - Ensure hot-reloading works within Docker. - Configured (Needs user testing)
- [x] 🔴 Setup Prisma with SQLite
  - Install Prisma CLI and Client. - Done
  - Initialize Prisma (`prisma init`). - Done
  - Define initial schema (`schema.prisma`) for User, Board, Column, Task, Subtask. - Done
  - Generate Prisma Client (`prisma generate`). - Done
  - Create and apply initial migration (`prisma migrate dev`). - Done
- [x] 🔴 Integrate Clerk Authentication
  - Install Clerk SDK (`@clerk/nextjs`). - Done
  - Configure environment variables (API Keys). - Done (Placeholders added, requires user input)
  - Set up middleware for protected routes. - Done
  - Implement Sign Up, Sign In functionality/pages. - Done
  - Add user button/profile display. - Done (Basic header)

## Phase 2: Feature Implementation - Boards & Columns

- [x] 🟡 Implement Board Creation UI & Logic
  - Create a page/section to display user's boards. - Done (Basic display on Home page)
  - Add a button/form (using Shadcn dialog/form) to create a new board. - Done (`CreateBoardForm` component)
  - Implement Server Action to handle board creation, linking to the current user. - Done (`create-board.ts` action)
- [x] 🟢 Implement Board Viewing
  - Fetch and display boards belonging to the logged-in user. - Done (On home page & board page)
  - Create a dynamic route for individual boards (e.g., `/board/[boardId]`). - Done
- [x] 🟡 Implement Column Management UI & Logic (within a Board page)
  - Fetch and display columns for the current board. - Done
  - Add UI (e.g., button) to add a new column. - Done (Inline form)
  - Implement Server Action for column creation. - Done
  - Add UI for renaming columns (inline edit or dialog). - Done (Inline edit)
  - Add UI for deleting columns (with confirmation). - Done (Button added, no confirmation yet)
  - Implement Server Actions for update/delete. - Done (Update Title, Delete Column)
- [x] 🔴 Implement Column Drag & Drop Reordering
  - Use a library like `@hello-pangea/dnd` or similar. - Done
  - Update column order in the database after DnD. - Done (`update-column-order` action)

## Phase 3: Feature Implementation - Tasks & Subtasks

- [ ] 🟡 Implement Task Creation UI & Logic
  - Add a button within each column to add a task.
  - Use a Shadcn Dialog/Modal with a Form (Input, Textarea, DatePicker, potentially Select for labels/assignee later).
  - Implement Server Action with Zod validation to create a task within a specific column.
- [~] 🟡 Implement Task Creation UI & Logic
  - Add a button within each column to add a task. - Done (Inline form)
  - Use a Shadcn Dialog/Modal with a Form (Input, Textarea, DatePicker, potentially Select for labels/assignee later). - Deferred (Using inline form for now)
  - Implement Server Action with Zod validation to create a task within a specific column. - Done
- [x] 🟢 Implement Task Viewing
  - Display tasks within their respective columns. - Done (`TaskItem`)
  - Show Task Title, potentially other details like due date. - Done (Title in item, details in modal)
- [~] 🟡 Implement Task Update UI & Logic
  - Allow clicking a task to open a detail view/modal (Dialog). - Done (via URL param)
  - Form within the dialog to edit title, description, due date etc. - Done (`TaskModal`)
  - Implement Server Action with Zod validation for updates. - Done (`update-task`)
- [x] 🟢 Implement Task Deletion
  - Add delete button to task card or detail view. - Done (In modal)
  - Implement Server Action with confirmation. - Done (`delete-task` action + `AlertDialog`)
- [x] 🔴 Implement Task Drag & Drop between Columns
  - Use the same DnD library as for columns. - Done
  - Update task's column association and potentially order within the new column in the database. - Done (`update-task-order` action)
- [ ] 🟡 Implement Subtask Creation UI & Logic
  - Within the Task Detail view/modal, add an input field to add subtasks.
  - Implement Server Action to create a subtask linked to the parent task.
- [ ] 🟢 Implement Subtask Viewing & Completion
  - Display list of subtasks within the Task Detail view.
  - Add checkboxes for each subtask.
  - Implement Server Action to toggle the `done` status of a subtask.
- [ ] 🟢 Implement Subtask Deletion
  - Add delete button next to each subtask.
  - Implement Server Action for deletion.
- [x] 🟡 Implement Subtask Creation UI & Logic
  - Within the Task Detail view/modal, add an input field to add subtasks. - Done
  - Implement Server Action to create a subtask linked to the parent task. - Done (`create-subtask`)
- [x] 🟢 Implement Subtask Viewing & Completion
  - Display list of subtasks within the Task Detail view. - Done
  - Add checkboxes for each subtask. - Done
  - Implement Server Action to toggle the `done` status of a subtask. - Done (`toggle-subtask`)
- [x] 🟢 Implement Subtask Deletion
  - Add delete button next to each subtask. - Done
  - Implement Server Action for deletion. - Done (`delete-subtask`)

## Phase 4: UI Refinements & Deployment Prep

- [ ] 🟢 Implement Responsive Design
  - Test and adjust layout for various screen sizes (mobile, tablet, desktop).
- [ ] 🟢 Implement Dark Mode
  - Use Tailwind's dark mode variant.
  - Add a toggle mechanism (e.g., using `next-themes`).
- [x] 🟢 Implement Dark Mode
  - Use Tailwind's dark mode variant. - Configured (`tailwind.config.ts`, `globals.css`)
  - Add a toggle mechanism (e.g., using `next-themes`). - Done (`ThemeProvider`, `ThemeToggle`)
- [ ] ⚪ Add UI Animations
  - Utilize `tailwindcss-animate` for subtle transitions/animations.
- [ ] 🟡 Configure Environment Variables for Deployment
  - Set up `.env.local` vs production environment variables (Clerk keys, `DATABASE_URL` - placeholder for future DB).
- [ ] 🟢 Prepare for Vercel Deployment
  - Ensure build process works correctly.
  - Add Vercel specific configurations if needed.
- [ ] ⚪ Add UI Animations
  - Utilize `tailwindcss-animate` for subtle transitions/animations.
- [x] 🟡 Configure Environment Variables for Deployment
  - Set up `.env.local` vs production environment variables (Clerk keys, `DATABASE_URL` - placeholder for future DB). - Done (Instructions provided for Vercel)
- [x] 🟢 Prepare for Vercel Deployment
  - Ensure build process works correctly. - Done (`vercel-build` script, dependencies moved)
  - Add Vercel specific configurations if needed. - Done (Build command, Root Directory)

## Phase 5: Future Enhancements (Nice to Have - Lower Priority)

- [ ] ⚪ Implement Comment Feature
- [ ] ⚪ Implement Notifications
- [ ] ⚪ Implement Tag/Label Filtering
- [ ] ⚪ Explore Real-time Updates 