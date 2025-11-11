import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Row, Col } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUserGraduate, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useParams, useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function StudentView() {
  const history = useHistory();
  const { projectId, id } = useParams();
  const [student, setStudent] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserRoleAndStudent();
  }, [id]);

  // Fetch user role and student details
  const fetchUserRoleAndStudent = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (profileError) throw profileError;
      setRole(profile.role);

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setStudent(data);
    } catch (err) {
      console.error("Error fetching student details:", err.message);
      setMessage("❌ Failed to load student details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!student)
    return (
      <Alert variant="danger" className="text-center">
        {message || "Student not found."}
      </Alert>
    );

  return (
    <div className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button variant="light" onClick={() => history.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
          </Button>
          <h4 className="fw-bold mt-3">
            <FontAwesomeIcon icon={faUserGraduate} className="me-2 text-primary" />
            Student Details
          </h4>
        </div>
        {role === "member" && (
          <Button
            variant="success"
            size="sm"
            onClick={() =>
              history.push(`/member/students/edit/${projectId}/${id}`)
            }
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit Student
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-0 p-4">
        {message && (
          <Alert variant={message.startsWith("❌") ? "danger" : "info"}>
            {message}
          </Alert>
        )}

        <Row>
          <Col md={6}>
            <p className="mb-2 text-muted fw-bold">Full Name</p>
            <h6>{student.full_name}</h6>
          </Col>
          <Col md={6}>
            <p className="mb-2 text-muted fw-bold">Email</p>
            <h6>{student.email}</h6>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <p className="mb-2 text-muted fw-bold">Phone</p>
            <h6>{student.phone || "—"}</h6>
          </Col>
          <Col md={6}>
            <p className="mb-2 text-muted fw-bold">Project ID</p>
            <h6>{student.project_id}</h6>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <p className="mb-2 text-muted fw-bold">Created At</p>
            <h6>{new Date(student.created_at).toLocaleString()}</h6>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
