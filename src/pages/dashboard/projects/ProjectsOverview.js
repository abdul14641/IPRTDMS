import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spinner, Alert } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faCheckCircle, faPauseCircle, faLayerGroup, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import { Routes } from "../../../routes";

export default function ProjectsOverview() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, onHold: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const history = useHistory();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        setErrorMsg("No active session found. Please sign in again.");
        return;
      }
      setUser(currentUser);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();
      if (error) throw error;

      setRole(profile.role);
      if (profile.role === "leader") await fetchLeaderStats(currentUser.id);
      else if (profile.role === "member") await fetchMemberStats(currentUser.id);
    } catch (err) {
      console.error("Error:", err.message);
      setErrorMsg("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderStats = async (leaderId) => {
    const { data, error } = await supabase.from("projects").select("status").eq("created_by", leaderId);
    if (error) return setErrorMsg("Error fetching leader stats.");
    updateStats(data);
  };

  const fetchMemberStats = async (userId) => {
    const { data, error } = await supabase.from("project_members").select("projects(status)").eq("user_id", userId);
    if (error) return setErrorMsg("Error fetching member stats.");
    const projectList = data.map((d) => d.projects);
    updateStats(projectList);
  };

  const updateStats = (data) => {
    const total = data.length;
    const active = data.filter((p) => p.status === "active").length;
    const completed = data.filter((p) => p.status === "completed").length;
    const onHold = data.filter((p) => p.status === "on-hold").length;
    setStats({ total, active, completed, onHold });
  };

  const handleNavigation = () => {
    if (role === "leader") history.push(Routes.ProjectCreateLeader.path);
    else history.push(Routes.ProjectListMember.path);
  };

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body>
        <Row className="align-items-center mb-3">
          <Col>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faLayerGroup} className="me-2 text-primary" />
              Project Overview
            </h5>
          </Col>
          <Col className="text-end">
            <Button
              variant={role === "leader" ? "primary" : "outline-primary"}
              size="sm"
              onClick={handleNavigation}
            >
              <FontAwesomeIcon icon={role === "leader" ? faPlus : faFolderOpen} className="me-2" />
              {role === "leader" ? "Create New Project" : "View My Projects"}
            </Button>
          </Col>
        </Row>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row className="text-center">
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Card className="p-3 border-0 bg-light shadow-sm">
                <FontAwesomeIcon icon={faLayerGroup} size="2x" className="text-primary mb-2" />
                <h6>Total Projects</h6>
                <h4>{stats.total}</h4>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Card className="p-3 border-0 bg-light shadow-sm">
                <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-success mb-2" />
                <h6>Active</h6>
                <h4>{stats.active}</h4>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Card className="p-3 border-0 bg-light shadow-sm">
                <FontAwesomeIcon icon={faPauseCircle} size="2x" className="text-warning mb-2" />
                <h6>On Hold</h6>
                <h4>{stats.onHold}</h4>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="mb-3">
              <Card className="p-3 border-0 bg-light shadow-sm">
                <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-success mb-2" />
                <h6>Completed</h6>
                <h4>{stats.completed}</h4>
              </Card>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
