import React, { useEffect, useState } from "react";
import {
  listStudents, createStudent, listCourses, createCourse, createEnrollment,
  getAvailableCourses, getStudentEnrollments, getStudentGrades,
} from "./api.js";

const styles = {
  page: { fontFamily: "system-ui, sans-serif", maxWidth: 960, margin: "0 auto", padding: 24, color: "#1a1a1a" },
  section: { border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 20 },
  h2: { marginTop: 0, fontSize: 18 },
  row: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  input: { padding: 6, border: "1px solid #ccc", borderRadius: 4 },
  button: { padding: "6px 12px", border: "none", borderRadius: 4, background: "#2563eb", color: "white", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", borderBottom: "1px solid #ccc", padding: 4, fontSize: 13 },
  td: { padding: 4, fontSize: 13, borderBottom: "1px solid #f0f0f0" },
  error: { color: "#b91c1c", fontSize: 13 },
  ok: { color: "#15803d", fontSize: 13 },
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState(null);

  const [newStudent, setNewStudent] = useState({ first_name: "", last_name: "", email: "" });
  const [newCourse, setNewCourse] = useState({ title: "", description: "", capacity: 30 });
  const [enrollment, setEnrollment] = useState({ student_id: "", course_id: "" });

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [details, setDetails] = useState(null);

  const refresh = async () => {
    const [s, c] = await Promise.allSettled([listStudents(), listCourses()]);
    setStudents(s.status === "fulfilled" && Array.isArray(s.value) ? s.value : []);
    setCourses(c.status === "fulfilled" && Array.isArray(c.value) ? c.value : []);
    if (s.status === "rejected" || c.status === "rejected") {
      setMessage({ type: "error", text: "Backend inaccessible — les tableaux sont vides." });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const notify = (type, text) => setMessage({ type, text });

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await createStudent(newStudent);
      setNewStudent({ first_name: "", last_name: "", email: "" });
      notify("ok", "Étudiant créé.");
      refresh();
    } catch (err) {
      notify("error", err.message);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await createCourse({ ...newCourse, capacity: Number(newCourse.capacity) });
      setNewCourse({ title: "", description: "", capacity: 30 });
      notify("ok", "Cours créé.");
      refresh();
    } catch (err) {
      notify("error", err.message);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await createEnrollment({
        student_id: Number(enrollment.student_id),
        course_id: Number(enrollment.course_id),
      });
      notify("ok", "Inscription réussie.");
      refresh();
    } catch (err) {
      notify("error", err.message);
    }
  };

  const loadDetails = async () => {
    if (!selectedStudentId) return;
    try {
      const [available, enrollments, grades] = await Promise.all([
        getAvailableCourses(selectedStudentId),
        getStudentEnrollments(selectedStudentId),
        getStudentGrades(selectedStudentId),
      ]);
      setDetails({ available, enrollments, grades });
    } catch (err) {
      notify("error", err.message);
    }
  };

  return (
    <div style={styles.page}>
      <h1>Université — Tableau de bord (patient système)</h1>
      {message && (
        <p style={message.type === "error" ? styles.error : styles.ok}>{message.text}</p>
      )}

      <div style={styles.section}>
        <h2 style={styles.h2}>Étudiants</h2>
        <form style={styles.row} onSubmit={handleCreateStudent}>
          <input style={styles.input} placeholder="Prénom" value={newStudent.first_name}
                 onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} required />
          <input style={styles.input} placeholder="Nom" value={newStudent.last_name}
                 onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} required />
          <input style={styles.input} placeholder="Email" type="email" value={newStudent.email}
                 onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required />
          <button style={styles.button} type="submit">Ajouter</button>
        </form>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Nom</th><th style={styles.th}>Email</th></tr></thead>
          <tbody>
            {(students ?? []).map((s) => (
              <tr key={s.id}>
                <td style={styles.td}>{s.id}</td>
                <td style={styles.td}>{s.first_name} {s.last_name}</td>
                <td style={styles.td}>{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2 style={styles.h2}>Cours</h2>
        <form style={styles.row} onSubmit={handleCreateCourse}>
          <input style={styles.input} placeholder="Titre" value={newCourse.title}
                 onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required />
          <input style={styles.input} placeholder="Description" value={newCourse.description}
                 onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} />
          <input style={styles.input} placeholder="Capacité" type="number" min="1" value={newCourse.capacity}
                 onChange={(e) => setNewCourse({ ...newCourse, capacity: e.target.value })} required />
          <button style={styles.button} type="submit">Ajouter</button>
        </form>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Titre</th><th style={styles.th}>Places libres</th></tr></thead>
          <tbody>
            {(courses ?? []).map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.id}</td>
                <td style={styles.td}>{c.title}</td>
                <td style={styles.td}>{c.availableSeats} / {c.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2 style={styles.h2}>Inscrire un étudiant à un cours</h2>
        <form style={styles.row} onSubmit={handleEnroll}>
          <input style={styles.input} placeholder="ID étudiant" type="number" value={enrollment.student_id}
                 onChange={(e) => setEnrollment({ ...enrollment, student_id: e.target.value })} required />
          <input style={styles.input} placeholder="ID cours" type="number" value={enrollment.course_id}
                 onChange={(e) => setEnrollment({ ...enrollment, course_id: e.target.value })} required />
          <button style={styles.button} type="submit">Inscrire</button>
        </form>
      </div>

      <div style={styles.section}>
        <h2 style={styles.h2}>Détails d'un étudiant (traverse les 3 services)</h2>
        <div style={styles.row}>
          <input style={styles.input} placeholder="ID étudiant" type="number" value={selectedStudentId}
                 onChange={(e) => setSelectedStudentId(e.target.value)} />
          <button style={styles.button} onClick={loadDetails} type="button">Charger</button>
        </div>
        {details && (
          <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6, fontSize: 12, overflowX: "auto" }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}