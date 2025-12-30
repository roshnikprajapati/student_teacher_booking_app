# Low-Level Design (LLD)

## Collections
- `users` (uid -> {name, email, role: 'student'|'teacher'|'admin'})
- `teachers` (auto-id -> {name, dept, subj, nameLower})
- `appointments` (auto-id -> {studentId, teacherId, preferredTime, status})
- `slots` (auto-id -> {teacherId, time})
- `logs` (auto-id -> {actor, action, details, ts})

## Important functions (client-side)
- `auth.createUserWithEmailAndPassword()` -> create student user + users doc
- `auth.signInWithEmailAndPassword()` -> sign-in flow
- Firestore queries for teachers & appointments
- Action logging to `logs` collection

## Security considerations
- Use Firestore rules to restrict writes:
  - Students can write appointments where `studentId == request.auth.uid`
  - Teachers can approve appointments where `teacherId == request.auth.uid`
  - Admin-only operations protected by custom claim or admin UID list

