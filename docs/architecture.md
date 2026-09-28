# Architecture

KSHSmanagement keeps every school service in this one repository: the cafeteria (meal card), dormitory, clinic, and later the LMS. They share one backend and one Expo app, which runs on phones and on the web. Each service is kept separate as its own module.

## Why one repository

- **The services share their core.** Students and their QR cards, staff sign-in, the API client, and the UI components are written once and used by every service.
- **Changes stay in one place.** A feature usually touches the backend, the phone app, and the web version together. Here that is one commit and one deploy.
- **It suits a small team.** There is one setup and one set of dependencies, with no versions to keep in sync between repos.
- **Services are still kept apart.** Each staff account belongs to one service, so cafeteria staff can't read clinic records.

## What separate repositories would cost

- The student list and sign-in would have to become a shared package or a separate service that every other repo depends on.
- A change that affects every service, such as how QR cards work, would need coordinated releases across repos.
- Staff could end up needing several apps and several logins.

## Folder layout as the backend grows

Move each service into its own folder, with shared code in `core/`:

```text
backend/src/
  core/     db, students, staff accounts, sign-in
  meals/
  dorm/
  clinic/
  lms/
```

## When to split a service out

- Different teams own different services and release on their own schedules.
- A service needs a different tech stack or hosting.

The LMS is the likeliest candidate. Courses, grades, file uploads, and students signing in themselves make it much bigger than the other services. Even then, it can start as its own folder (for example `lms/`) in this repo, sharing the backend's student list and sign-in.

## Before building the LMS

The LMS is by far the biggest piece. Check first whether an existing one, such as Moodle or Google Classroom, meets the school's needs.
