import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faPlus,
  faEdit,
  faTrash,
  faSyncAlt,
  faArrowLeft,
  faEye,
  faClipboardCheck,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory, useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function StudentManage() {
  const history = useHistory();
  const { projectId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (projectId) fetchStudents();
  }, [projectId]);

  const fetchUserRole = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();
      if (error) throw error;
      setRole(data.role);
    } catch (err) {
      console.error("Error fetching role:", err.message);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      setMessage("❌ Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      setMessage("⚠️ Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from("students").insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          project_id: projectId,
        },
      ]);
      if (error) throw error;

      setMessage("✅ Student added successfully.");
      setFormData({ full_name: "", email: "", phone: "" });
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      console.error("Error adding student:", err.message);
      setMessage("❌ Failed to add student.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      setMessage("🗑️ Student deleted.");
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err.message);
      setMessage("❌ Failed to delete student.");
    }
  };

  const handleEditStudent = (id) => {
    history.push(`/member/students/edit/${projectId}/${id}`);
  };

  const handleViewStudent = (id) => {
    history.push(`/member/students/view/${projectId}/${id}`);
  };

  const handleAttendanceClick = () => {
    if (role === "leader") {
      history.push(`/leader/attendance/history/${projectId}`);
    } else {
      history.push(`/member/attendance/manage/${projectId}`);
    }
  };

  const handleSummaryClick = () => {
    if (role === "leader") {
      history.push(`/leader/attendance/summary/${projectId}`);
    } else {
      history.push(`/member/attendance/summary/${projectId}`);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div className="mb-2">
          <Button variant="light" onClick={() => history.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
          </Button>
          <h4 className="fw-bold mt-3">
            <FontAwesomeIcon icon={faUserGraduate} className="me-2 text-primary" />
            Student Management
          </h4>
        </div>

        <div className="text-end">
          {role === "member" && (
            <Button
              variant="primary"
              size="sm"
              className="me-2"
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Student
            </Button>
          )}

          {/* Attendance Button */}
          <Button
            variant={role === "leader" ? "outline-success" : "success"}
            size="sm"
            className="me-2"
            onClick={handleAttendanceClick}
          >
            <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
            {role === "leader" ? "View Attendance" : "Mark Attendance"}
          </Button>

          {/* Summary Button */}
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={handleSummaryClick}
          >
            <FontAwesomeIcon icon={faChartPie} className="me-2" />
            Summary
          </Button>

          <Button variant="outline-secondary" size="sm" onClick={fetchStudents}>
            <FontAwesomeIcon icon={faSyncAlt} className="me-1" /> Refresh
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.startsWith("✅") ? "success" : "info"}>
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {students.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No students found for this project.
            </p>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || "—"}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewStudent(s.id)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      {role === "member" && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditStudent(s.id)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteStudent(s.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Student Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddStudent}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>

            <div className="text-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Student"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
