import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner, Alert } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import { useHistory, useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function StudentEdit() {
  const history = useHistory();
  const { projectId, id } = useParams();
  const [student, setStudent] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!student.full_name || !student.email) {
      setMessage("⚠️ Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from("students")
        .update({
          full_name: student.full_name,
          email: student.email,
          phone: student.phone,
        })
        .eq("id", id);
      if (error) throw error;

      setMessage("✅ Student updated successfully.");
      setTimeout(() => {
        history.push(`/member/students/manage/${projectId}`);
      }, 1200);
    } catch (err) {
      console.error("Error updating student:", err.message);
      setMessage("❌ Failed to update student.");
    } finally {
      setSaving(false);
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button variant="light" onClick={() => history.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
          </Button>
          <h4 className="fw-bold mt-3">
            <FontAwesomeIcon icon={faUserGraduate} className="me-2 text-primary" />
            Edit Student
          </h4>
        </div>
      </div>

      <Card className="shadow-sm border-0 p-4">
        {message && (
          <Alert variant={message.startsWith("✅") ? "success" : "danger"}>
            {message}
          </Alert>
        )}

        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter full name"
              value={student.full_name}
              onChange={(e) => setStudent({ ...student, full_name: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={student.email}
              onChange={(e) => setStudent({ ...student, email: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone number"
              value={student.phone || ""}
              onChange={(e) => setStudent({ ...student, phone: e.target.value })}
            />
          </Form.Group>

          <div className="text-end">
            <Button variant="primary" type="submit" disabled={saving}>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {saving ? "Saving..." : "Update Student"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
