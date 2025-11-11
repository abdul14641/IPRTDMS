import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Alert,
  Spinner,
  Form,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory, useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function AttendanceManage() {
  const { projectId } = useParams();
  const history = useHistory();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (projectId) fetchStudents();
  }, [projectId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, email")
        .eq("project_id", projectId)
        .order("full_name", { ascending: true });

      if (error) throw error;
      setStudents(data || []);
      const defaultState = {};
      data.forEach((s) => {
        defaultState[s.id] = "present";
      });
      setAttendance(defaultState);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      setMessage("❌ Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!date) {
      setMessage("⚠️ Please select a date before saving.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id,
        project_id: projectId,
        date,
        status,
      }));

      // Delete old attendance for the same date before inserting new
      await supabase
        .from("attendance")
        .delete()
        .eq("project_id", projectId)
        .eq("date", date);

      const { error } = await supabase.from("attendance").insert(records);
      if (error) throw error;

      setMessage("✅ Attendance saved successfully.");
    } catch (err) {
      console.error("Error saving attendance:", err.message);
      setMessage("❌ Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-4">
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button variant="light" onClick={() => history.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
          </Button>
          <h4 className="fw-bold mt-3">
            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-primary" />
            Mark Attendance
          </h4>
        </div>

        <div className="text-end">
          <Form.Group className="mb-0">
            <Form.Label className="me-2 fw-bold">Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ display: "inline-block", width: "auto" }}
            />
          </Form.Group>
        </div>
      </div>

      {message && (
        <Alert
          variant={message.startsWith("✅") ? "success" : "danger"}
          className="mb-3"
        >
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-muted mb-0">No students found for this project.</p>
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>{s.full_name}</td>
                      <td>{s.email}</td>
                      <td className="text-center">
                        <Button
                          variant={
                            attendance[s.id] === "present"
                              ? "success"
                              : "outline-success"
                          }
                          size="sm"
                          className="me-2"
                          onClick={() => handleAttendanceChange(s.id, "present")}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} /> Present
                        </Button>
                        <Button
                          variant={
                            attendance[s.id] === "absent"
                              ? "danger"
                              : "outline-danger"
                          }
                          size="sm"
                          onClick={() => handleAttendanceChange(s.id, "absent")}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} /> Absent
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
