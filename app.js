const auth = firebase.auth();
const db = firebase.firestore();

// ================================
// Logging Utility
// ================================
async function logAction(actor, action, details = {}) {
    const payload = {
        actor: actor || "unknown",
        action,
        details,
        ts: firebase.firestore.FieldValue.serverTimestamp()
    };

    console.log("LOG:", payload);

    try {
        await db.collection("logs").add(payload);
    } catch (e) {
        console.warn("Failed to write log:", e);
    }
}

// ================================
// DOM Loaded
// ================================
document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------------------
       STUDENT REGISTER
    ------------------------------------ */
    const btnRegister = document.getElementById("btn-register");
    if (btnRegister) {
        btnRegister.addEventListener("click", async () => {
            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;

            if (!email || !pass) return alert("Enter email & password");

            try {
                const userCred = await auth.createUserWithEmailAndPassword(email, pass);

                await db.collection("users").doc(userCred.user.uid).set({
                    name, email, role: "student",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("Registered successfully!");
                logAction(email, "student_register");
            } catch (err) {
                alert("Registration error: " + err.message);
            }
        });
    }

    /* ------------------------------------
       STUDENT LOGIN
    ------------------------------------ */
    const btnLogin = document.getElementById("btn-login");
    if (btnLogin) {
        btnLogin.addEventListener("click", async () => {
            const email = document.getElementById("login-email").value.trim();
            const pass = document.getElementById("login-pass").value;

            try {
                await auth.signInWithEmailAndPassword(email, pass);
                alert("Logged in as " + email);
                logAction(email, "student_login");
                loadStudentUI();
            } catch (err) {
                alert("Login error: " + err.message);
            }
        });
    }

    /* ------------------------------------
       TEACHER LOGIN
    ------------------------------------ */
    const btnTeacherLogin = document.getElementById("btn-teacher-login");
    if (btnTeacherLogin) {
        btnTeacherLogin.addEventListener("click", async () => {
            const email = document.getElementById("teacher-email").value.trim();
            const pass = document.getElementById("teacher-pass").value;

            try {
                await auth.signInWithEmailAndPassword(email, pass);

                const u = auth.currentUser;
                const doc = await db.collection("users").doc(u.uid).get();

                if (!doc.exists || doc.data().role !== "teacher") {
                    alert("Not a teacher account");
                    auth.signOut();
                    return;
                }

                document.getElementById("teacher-actions").style.display = "block";
                logAction(email, "teacher_login");
                loadTeacherUI();
            } catch (err) {
                alert("Teacher login error: " + err.message);
            }
        });
    }
/* ------------------------------------
   ADMIN LOGIN
------------------------------------ */
const btnAdminLogin = document.getElementById("btn-admin-login");
if (btnAdminLogin) {
    btnAdminLogin.addEventListener("click", async () => {
        const email = document.getElementById("admin-email").value.trim();
        const pass = document.getElementById("admin-pass").value;

        // Hardcoded admin email
        const ADMIN_EMAIL = "roshnisharma@gmail.com";

        try {
            await auth.signInWithEmailAndPassword(email, pass);

            if (email !== ADMIN_EMAIL) {
                alert("Not authorized as admin");
                auth.signOut();
                return;
            }

            // Success
            logAction(email, "admin_login");
            window.location.href = "admin.html";
        } catch (err) {
            alert("Admin login error: " + err.message);
        }
    });
}

    /* ------------------------------------
       ADMIN ADD TEACHER
    ------------------------------------ */
    const btnAddTeacher = document.getElementById("btn-add-teacher");
    if (btnAddTeacher) {
        btnAddTeacher.addEventListener("click", async () => {
            const name = document.getElementById("t-name").value.trim();
            const dept = document.getElementById("t-dept").value.trim();
            const subject = document.getElementById("t-subject").value.trim();

            if (!name) return alert("Enter teacher name!");

            const docRef = await db.collection("teachers").add({
                name,
                department: dept,
                subject,
                nameLower: name.toLowerCase(),
                deptLower: dept.toLowerCase(),
                subjLower: subject.toLowerCase(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Teacher added!");
            logAction("admin", "add_teacher", { id: docRef.id });

            document.getElementById("t-name").value = "";
            document.getElementById("t-dept").value = "";
            document.getElementById("t-subject").value = "";
        });
    }

    /* ------------------------------------
       REAL-TIME LOAD TEACHERS (ADMIN PAGE)
    ------------------------------------ */
    if (document.getElementById("admin-teachers")) {
        db.collection("teachers").onSnapshot(snapshot => {
            let html = "";
            snapshot.forEach(doc => {
                const t = doc.data();
                html += `
                    <p>
                        <b>${t.name}</b> — ${t.department} — ${t.subject}
                        <button onclick="deleteTeacher('${doc.id}')" class="small-del">Delete</button>
                    </p>`;
            });

            document.getElementById("admin-teachers").innerHTML = html;
            document.getElementById("tcount").innerText = snapshot.size;
        });
    }

    window.deleteTeacher = async function (id) {
        if (!confirm("Delete this teacher?")) return;
        await db.collection("teachers").doc(id).delete();
        logAction("admin", "delete_teacher", { id });
    };

    /* ------------------------------------
       REAL-TIME LOAD STUDENTS
    ------------------------------------ */
    if (document.getElementById("admin-students")) {
        db.collection("users").where("role", "==", "student")
            .onSnapshot(snapshot => {
                let html = "";
                snapshot.forEach(doc => {
                    const s = doc.data();
                    html += `<p><b>${s.name}</b> — ${s.email}</p>`;
                });

                document.getElementById("admin-students").innerHTML = html;
                document.getElementById("scount").innerText = snapshot.size;
            });
    }

    /* ------------------------------------
       REAL-TIME APPOINTMENT COUNT
    ------------------------------------ */
    if (document.getElementById("acount")) {
        db.collection("appointments").onSnapshot(snap => {
            document.getElementById("acount").innerText = snap.size;
        });
    }

    /* ------------------------------------
       STUDENT BOOK APPOINTMENT
    ------------------------------------ */
    const btnBook = document.getElementById("btn-book");
    if (btnBook) {
        btnBook.addEventListener("click", async () => {
            const user = auth.currentUser;
            if (!user) return alert("Login first!");

            const tId = window.selectedTeacherId;
            if (!tId) return alert("Select a teacher!");

            const purpose = document.getElementById("appt-purpose").value.trim();
            const time = document.getElementById("appt-time").value;

            const ref = await db.collection("appointments").add({
                studentId: user.uid,
                teacherId: tId,
                purpose,
                preferredTime: time ? new Date(time) : null,
                status: "requested",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Appointment requested!");
            logAction(user.email, "book_appointment", { appt: ref.id });
        });
    }

    /* ------------------------------------
       SEARCH TEACHERS (Student)
    ------------------------------------ */
    const searchInput = document.getElementById("search-teacher");
    if (searchInput) {
        searchInput.addEventListener("input", async (e) => {
            const q = e.target.value.trim().toLowerCase();
            const container = document.getElementById("teacher-list");

            let snap;
            if (!q) {
                snap = await db.collection("teachers").limit(20).get();
            } else {
                snap = await db.collection("teachers")
                    .where("nameLower", ">=", q)
                    .where("nameLower", "<=", q + "\uf8ff")
                    .limit(20).get();
            }

            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            container.innerHTML = items.length
                ? items.map(t => `<p><a href="#" class="select-teacher" data-id="${t.id}">${t.name} — ${t.department} — ${t.subject}</a></p>`).join("")
                : "No teacher found";

            attachTeacherSelector();
        });
    }

    function attachTeacherSelector() {
        document.querySelectorAll(".select-teacher").forEach(a => {
            a.addEventListener("click", e => {
                e.preventDefault();
                const id = a.getAttribute("data-id");
                window.selectedTeacherId = id;
                document.getElementById("selected-teacher").innerText = "Selected Teacher ID: " + id;
            });
        });
    }

    /* ------------------------------------
       LOAD STUDENT UI
    ------------------------------------ */
    async function loadStudentUI() {
        const u = auth.currentUser;
        if (!u) return;

        db.collection("appointments")
            .where("studentId", "==", u.uid)
            .orderBy("createdAt", "desc")
            .onSnapshot(snap => {
                document.getElementById("appointments-list").innerHTML =
                    snap.docs.map(d => {
                        const a = d.data();
                        return `<div>${a.purpose || "No purpose"} — ${a.status}</div>`;
                    }).join("") || "No appointments";
            });
    }

    /* ------------------------------------
       LOAD TEACHER UI
    ------------------------------------ */
    async function loadTeacherUI() {
        loadTeacherSlots();
        loadTeacherAppointments();
    }

    function loadTeacherSlots() {
        const u = auth.currentUser;
        if (!u) return;

        db.collection("slots")
            .where("teacherId", "==", u.uid)
            .onSnapshot(snap => {
                document.getElementById("slots-list").innerHTML =
                    snap.docs.map(d => `<div>${new Date(d.data().time.seconds * 1000).toString()}</div>`).join("") || "No slots";
            });
    }

    function loadTeacherAppointments() {
        const u = auth.currentUser;
        if (!u) return;

        db.collection("appointments")
            .where("teacherId", "==", u.uid)
            .onSnapshot(snap => {
                document.getElementById("teacher-appointments").innerHTML =
                    snap.docs.map(d => {
                        const a = d.data();
                        return `
                            <div>
                                <b>${a.purpose}</b> — status: ${a.status}
                                <button data-id="${d.id}" class="approve">Approve</button>
                                <button data-id="${d.id}" class="cancel">Cancel</button>
                            </div>`;
                    }).join("") || "No appointments";

                document.querySelectorAll(".approve").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const id = btn.getAttribute("data-id");
                        await db.collection("appointments").doc(id).update({ status: "approved" });
                    });
                });

                document.querySelectorAll(".cancel").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const id = btn.getAttribute("data-id");
                        await db.collection("appointments").doc(id).update({ status: "cancelled" });
                    });
                });
            });
    }
});
