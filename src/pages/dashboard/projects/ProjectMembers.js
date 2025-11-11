import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Alert,
  Spinner,
  Form,
  Modal,
  Dropdown,
  ButtonGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faPlus,
  faTrash,
  faSyncAlt,
  faArrowLeft,
  faCheckCircle,
  faChartBar,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory, useLocation } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function ProjectMembers() {
  const history = useHistory();
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get("project");
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchProjectMembers();
      fetchAvailableMembers();
    } else {
      setMessage("⚠️ No project ID provided.");
      setLoading(false);
    }
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

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_name, description, status")
        .eq("id", projectId)
        .single();
      if (error) throw error;
      setProject(data);
    } catch (err) {
      console.error("Error fetching project:", err.message);
      setMessage("❌ Failed to fetch project details.");
    }
  };

  const fetchProjectMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_members")
        .select("id, user_id, profiles(full_name, email)")
        .eq("project_id", projectId);
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching members:", err.message);
      setMessage("❌ Failed to fetch project members.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "member");
      if (error) throw error;
      setAvailableMembers(data || []);
    } catch (err) {
      console.error("Error loading available members:", err.message);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;
    try {
      const exists = members.some((m) => m.user_id === selectedMember);
      if (exists) {
        setMessage("⚠️ Member already assigned to this project.");
        return;
      }

      const { error } = await supabase.from("project_members").insert([
        {
          project_id: projectId,
          user_id: selectedMember,
        },
      ]);
      if (error) throw error;

      setMessage("✅ Member added successfully.");
      setShowModal(false);
      setSelectedMember("");
      fetchProjectMembers();
    } catch (err) {
      console.error("Error adding member:", err.message);
      setMessage("❌ Failed to add member.");
    }
  };

  const handleRemoveMember = async (id) => {
    if (!window.confirm("Remove this member from project?")) return;
    try {
      const { error } = await supabase.from("project_members").delete().eq("id", id);
      if (error) throw error;

      setMessage("🗑️ Member removed successfully.");
      fetchProjectMembers();
    } catch (err) {
      console.error("Error removing member:", err.message);
      setMessage("❌ Failed to remove member.");
    }
  };

  const handleAttendance = (type) => {
    const base = role === "leader" ? "/leader" : "/member";
    if (type === "manage") history.push(`${base}/attendance/manage/${projectId}`);
    else if (type === "history") history.push(`${base}/attendance/history/${projectId}`);
    else if (type === "summary") history.push(`${base}/attendance/summary/${projectId}`);
    else if (type === "visual") history.push(`${base}/attendance/visual/${projectId}`);
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button variant="light" onClick={() => history.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
          </Button>
          {project && (
            <h4 className="fw-bold mt-3">
              <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
              {project.project_name} - Members
            </h4>
          )}
        </div>

        <div>
          {role === "leader" ? (
            <>
              <Button
                variant="outline-info"
                size="sm"
                className="me-2"
                onClick={() => handleAttendance("history")}
              >
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Attendance History
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleAttendance("visual")}
              >
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                Visual Summary
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                className="me-2"
                onClick={() => setShowModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Member
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                className="me-2"
                onClick={() => handleAttendance("manage")}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                Mark Attendance
              </Button>
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => handleAttendance("summary")}
              >
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                Attendance Summary
              </Button>
            </>
          )}

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchProjectMembers}
          >
            <FontAwesomeIcon icon={faSyncAlt} className="me-1" /> Refresh
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.startsWith("✅") ? "success" : "info"}>{message}</Alert>
      )}

      {/* Member List */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          {members.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No members assigned to this project.
            </p>
          ) : (
            <Table hover responsive className="align-items-center">
              <thead className="thead-light">
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  {role === "leader" ? <th>Attendance</th> : <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m, index) => (
                  <tr key={m.id}>
                    <td>{index + 1}</td>
                    <td>{m.profiles?.full_name || "—"}</td>
                    <td>{m.profiles?.email || "—"}</td>
                    <td>
                      {role === "leader" ? (
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleAttendance("history")}
                        >
                          <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                          View Attendance
                        </Button>
                      ) : (
                        <Dropdown as={ButtonGroup}>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            id={`dropdown-${m.id}`}
                          >
                            Manage
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => handleAttendance("manage")}
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
                              Mark Attendance
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleAttendance("history")}
                            >
                              <FontAwesomeIcon icon={faClipboardList} className="me-2 text-info" />
                              View History
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleRemoveMember(m.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
                              Remove
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Member Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Member to Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Member</Form.Label>
            <Form.Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">-- Choose Member --</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.email})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="text-end">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="me-2"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddMember}>
              Add Member
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
