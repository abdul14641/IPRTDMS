import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Alert,
  Spinner,
  ButtonGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderOpen,
  faPlus,
  faUsers,
  faSyncAlt,
  faClipboardList,
  faClipboardCheck, // for attendance
  faFileInvoiceDollar, // for requisitions
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function ProjectsList() {
  const history = useHistory();
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserAndProjects();
  }, []);

  const fetchUserAndProjects = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }
      setUser(currentUser);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", currentUser.id)
        .single();

      if (profileError) throw profileError;
      setRole(profile.role);

      if (profile.role === "leader") {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("created_by", currentUser.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProjects(data);
      } else {
        const { data: assignments, error: assignError } = await supabase
          .from("project_members")
          .select("project_id")
          .eq("user_id", currentUser.id);
        if (assignError) throw assignError;

        const projectIds = assignments.map((a) => a.project_id);
        if (projectIds.length === 0) {
          setProjects([]);
          return;
        }

        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .in("id", projectIds)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProjects(data);
      }
    } catch (err) {
      console.error("Error loading projects:", err.message);
      setMessage("❌ Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation
  const handleViewStudents = (projectId) => {
    if (role === "leader")
      history.push(`/leader/students/manage/${projectId}`);
    else history.push(`/member/students/manage/${projectId}`);
  };

  const handleAttendance = (projectId) => {
    if (role === "leader")
      history.push(`/leader/attendance/history/${projectId}`);
    else history.push(`/member/attendance/manage/${projectId}`);
  };

  const handleRequisition = (projectId) => {
    // ✅ FIXED: Route now matches the actual routes in HomePage.js
    if (role === "leader")
      history.push("/leader/requisitions/summary");
    else history.push(`/member/requisitions/create/${projectId}`);
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
          {role === "leader" ? "My Projects" : "Assigned Projects"}
        </h4>
        {role === "leader" && (
          <div>
            <Button
              variant="primary"
              size="sm"
              className="me-2"
              onClick={() => history.push("/leader/projects/create")}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" /> New Project
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={fetchUserAndProjects}
            >
              <FontAwesomeIcon icon={faSyncAlt} className="me-1" /> Refresh
            </Button>
          </div>
        )}
      </div>

      {message && <Alert variant="info">{message}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No projects found.
            </p>
          ) : (
            <Table
              hover
              responsive
              className="align-items-center table-flush"
            >
              <thead className="thead-light">
                <tr>
                  <th>#</th>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.project_name}</td>
                    <td>{p.description || "—"}</td>
                    <td>{p.status}</td>
                    <td>{p.start_date || "—"}</td>
                    <td>{p.end_date || "—"}</td>
                    <td className="text-center">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          onClick={() => handleViewStudents(p.id)}
                        >
                          <FontAwesomeIcon icon={faUsers} /> Students
                        </Button>
                        <Button
                          variant="outline-success"
                          onClick={() => handleAttendance(p.id)}
                        >
                          <FontAwesomeIcon icon={faClipboardCheck} /> Attendance
                        </Button>
                        <Button
                          variant="outline-warning"
                          onClick={() => handleRequisition(p.id)}
                        >
                          <FontAwesomeIcon
                            icon={faFileInvoiceDollar}
                          />{" "}
                          Requisition
                        </Button>
                      </ButtonGroup>
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
