import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function RequisitionCreate() {
  const history = useHistory();

  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(true);

  // Fetch all projects assigned to this member
  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const fetchAssignedProjects = async () => {
    try {
      setFetching(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }

      // Get member's assigned projects
      const { data: assignments, error } = await supabase
        .from("project_members")
        .select("project_id, projects(project_name)")
        .eq("user_id", currentUser.id);

      if (error) throw error;

      const formatted = assignments.map((a) => ({
        id: a.project_id,
        name: a.projects?.project_name || "Unnamed Project",
      }));

      setProjects(formatted);
      setFetching(false);
    } catch (err) {
      console.error("Error fetching projects:", err.message);
      setMessage("❌ Failed to load your projects.");
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_id || !formData.title || !formData.amount) {
      setMessage("⚠️ Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("User not authenticated.");

      const { error } = await supabase.from("requisitions").insert([
        {
          project_id: formData.project_id,
          submitted_by: userId,
          title: formData.title,
          description: formData.description || null,
          amount: parseFloat(formData.amount),
          status: "pending",
          created_at: new Date(),
        },
      ]);

      if (error) throw error;

      setMessage("✅ Requisition submitted successfully.");
      setFormData({ project_id: "", title: "", description: "", amount: "" });
    } catch (err) {
      console.error("Error creating requisition:", err.message);
      setMessage("❌ Failed to create requisition.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      <Button variant="light" className="mb-3" onClick={() => history.goBack()}>
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back
      </Button>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <h4 className="fw-bold mb-4">Submit Project Requisition</h4>

          {message && (
            <Alert
              variant={message.startsWith("✅") ? "success" : "danger"}
              className="mb-3"
            >
              {message}
            </Alert>
          )}

          {fetching ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading your assigned projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <Alert variant="info">
              You have no assigned projects. Please contact your leader.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              {/* Project List Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Select Project</Form.Label>
                <Form.Select
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData({ ...formData, project_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Title */}
              <Form.Group className="mb-3">
                <Form.Label>Requisition Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter requisition title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </Form.Group>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe the purpose of this requisition"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>

              {/* Amount */}
              <Form.Group className="mb-3">
                <Form.Label>Amount (RM)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <div className="text-end">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Submit Requisition
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
