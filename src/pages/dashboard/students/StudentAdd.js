import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from "@themesberg/react-bootstrap";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faArrowLeft,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../config/supabaseClient";

export default function StudentAdd() {
  const history = useHistory();
  const [role, setRole] = useState(null);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    project_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserAndProjects();
  }, []);

  // 🔹 Fetch current user + role + available projects
  const fetchUserAndProjects = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;

      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }

      // Get user role
      const { data: profile, error: roleError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (roleError) throw roleError;
      setRole(profile.role);

      // If member, get only their assigned projects
      if (profile.role === "member") {
        const { data, error } = await supabase
          .from("project_members")
          .select("project_id, projects(project_name)")
          .eq("user_id", currentUser.id);

        if (error) throw error;

        const formatted = data.map((d) => ({
          id: d.project_id,
          name: d.projects.project_name,
        }));
        setProjects(formatted);
      } else if (profile.role === "leader") {
        // Leader shouldn’t access this page directly
        setMessage("Leaders cannot add students. View only access allowed.");
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setMessage("❌ Failed to load user or project data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.project_id) {
      return setMessage("⚠️ Please fill all required fields.");
    }

    try {
      const { error } = await supabase.from("students").insert([formData]);
      if (error) throw error;

      setMessage("✅ Student added successfully!");
      setFormData({ full_name: "", email: "", phone: "", project_id: "" });
    } catch (err) {
      console.error("Error adding student:", err.message);
      setMessage("❌ Failed to add student.");
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  // If leader tries to access this page
  if (role === "leader")
    return (
      <Alert variant="warning" className="text-center mt-4">
        Leaders cannot add students. Please view students from the Student List.
      </Alert>
    );

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="light" onClick={() => history.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white">
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          Add New Student
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="info">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
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
              </Col>

              <Col md={6}>
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
              </Col>
            </Row>

            <Row>
              <Col md={6}>
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
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assign to Project</Form.Label>
                  <Form.Select
                    value={formData.project_id}
                    onChange={(e) =>
                      setFormData({ ...formData, project_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end">
              <Button variant="success" type="submit">
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                Add Student
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
