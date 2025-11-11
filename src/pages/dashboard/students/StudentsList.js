import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUserEdit,
  faEye,
  faTrash,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function StudentList() {
  const history = useHistory();
  const [students, setStudents] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔹 Load data
  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (role) fetchStudents();
  }, [role]);

  // 🔹 Fetch user role
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

  // 🔹 Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, email, phone, project_id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      setMessage("❌ Failed to load student list.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete student (members only)
  const handleDelete = async (id) => {
    if (role !== "member") return;
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      setStudents(students.filter((s) => s.id !== id));
      setMessage("🗑️ Student deleted successfully.");
    } catch (err) {
      console.error("Error deleting student:", err.message);
      setMessage("❌ Failed to delete student.");
    }
  };

  return (
    <div className="py-4">
      {/* Header Bar */}
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="fw-bold mb-0">
            <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
            Student List
          </h4>
        </Col>
        {role === "member" && (
          <Col className="text-end">
            <Button
              variant="primary"
              onClick={() => history.push("/member/students/add")}
            >
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              Add Student
            </Button>
          </Col>
        )}
      </Row>

      {/* Message */}
      {message && <Alert variant="info">{message}</Alert>}

      {/* Student Table */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-muted mb-0">No students found.</p>
          ) : (
            <Table hover responsive className="align-items-center">
              <thead className="thead-light">
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Project ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, index) => (
                  <tr key={s.id}>
                    <td>{index + 1}</td>
                    <td>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || "—"}</td>
                    <td>{s.project_id || "—"}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        onClick={() => history.push(`/students/view/${s.id}`)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      {role === "member" && (
                        <>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => history.push(`/students/edit/${s.id}`)}
                          >
                            <FontAwesomeIcon icon={faUserEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(s.id)}
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
    </div>
  );
}
