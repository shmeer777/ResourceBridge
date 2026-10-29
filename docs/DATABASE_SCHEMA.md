# Database Schema Plan

Planned entities:
- users
- user_roles
- organizations
- organization_members
- resources
- resource_policies
- availability_slots
- bookings
- checkin_records
- condition_reports
- incidents
- audit_events

Design rules:
- Store password hashes, never plaintext passwords.
- Enforce ownership and role permissions on the backend.
- Validate booking status transitions.
- Prevent overlapping approved bookings with database-safe constraints/transactions.
- Record actor, action, target, and timestamp for important audit events.
