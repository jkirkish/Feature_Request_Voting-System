# Feature_Request_Voting-System

Feature Request + Voting System
Assignment Requirements Document


Tech Stack
Frontend: Next.js (React)
Backend: Next.js API routes
Authentication: NextAuth.js (email/password)
Database: MySQL (or PostgreSQL)
ORM: Prisma
Core Features
1. User Authentication
Implement NextAuth.js with email/password authentication.
Users must log in to submit feature requests or upvote.
Use session management to persist login state.
2. Feature Request Submission
Once logged in, users can submit new feature requests.
Each request must include:
Title (Required, max 100 characters)
Description (Required, max 500 characters)
The system should store:
The user ID of the creator.
A timestamp for when the request was submitted.
3. Feature Request Listing
A public list of all submitted feature requests.
Sorted by the number of upvotes (highest first).
4. Upvoting & Removing Votes
Logged-in users can upvote any feature request.
Each user can only vote once per feature.
Users should also be able to remove their vote.









Stretch Goals (Optional Enhancements)
If you finish the core functionality, and want to keep going with it, you can add extra features:

Admin Dashboard: An admin role that can mark features as "Planned" or "Completed".
