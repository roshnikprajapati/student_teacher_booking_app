# Test Cases

1. Student Registration
   - Input: valid email, password, name
   - Expected: Auth user created, users/{uid} doc with role student

2. Login Flow
   - Student/Teacher login with valid credentials -> success

3. Search Teacher
   - Search by name, dept, subject -> results list

4. Book appointment
   - Logged-in student requests appointment -> appointments doc created status 'requested'

5. Approve appointment
   - Teacher approves -> appointment.status becomes 'approved'

6. Admin CRUD for teachers
   - Add teacher -> teacher doc created
   - Delete teacher -> teacher doc removed

Edge cases:
- Unauthenticated user tries to book -> should be blocked client-side and by security rules
