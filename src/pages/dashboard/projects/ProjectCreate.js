import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col, Alert, Spinner } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheckCircle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function ProjectCreate() {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active",
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchLeaderAndMembers();
  }, []);

  const fetchLeaderAndMembers = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }
      setUser(currentUser);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "member");

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching members:", err.message);
      setMessage("❌ Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_name) {
      setMessage("⚠️ Project name is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            project_name: formData.project_name,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            created_by: user.id,
          },
        ])
        .select("id")
        .single();

      if (projectError) throw projectError;

      if (selectedMembers.length > 0) {
        const assignments = selectedMembers.map((memberId) => ({
          project_id: project.id,
          user_id: memberId,
        }));
        const { error: assignError } = await supabase
          .from("project_members")
          .insert(assignments);
        if (assignError) throw assignError;
      }

      setMessage("✅ Project created successfully.");
      setFormData({
        project_name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "active",
      });
      setSelectedMembers([]);
    } catch (err) {
      console.error("Error creating project:", err.message);
      setMessage("❌ Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  const handleMemberSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setSelectedMembers(selected);
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
        <Button variant="light" onClick={() => history.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
        </Button>
        <h4 className="fw-bold mb-0">
          <FontAwesomeIcon icon={faPlus} className="me-2 text-primary" />
          Create New Project
        </h4>
      </div>

      <Card className="shadow-sm border-0 p-4">
        {message && (
          <Alert variant={message.startsWith("✅") ? "success" : "danger"}>{message}</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter project name"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter short project description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Assign Members</Form.Label>
            <Form.Select multiple onChange={handleMemberSelect} style={{ height: "150px" }}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.email})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="text-end">
            <Button variant="primary" type="submit" disabled={saving}>
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              {saving ? "Saving..." : "Create Project"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
