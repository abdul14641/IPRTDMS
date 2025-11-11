import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Alert } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faUserClock,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../config/supabaseClient";

export default function AttendanceDashboardWidget() {
  const [role, setRole] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    attended: 0,
    absences: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (role) fetchAttendanceSummary();
  }, [role]);

  const fetchUserRole = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (error) throw error;
      setRole(data.role);
    } catch (err) {
      console.error("Error fetching role:", err.message);
      setMessage("❌ Unable to fetch role.");
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      let records = [];

      if (role === "leader") {
        const { data, error } = await supabase
          .from("attendance")
          .select("status, project_id, projects(created_by)")
          .eq("projects.created_by", user.id);
        if (error) throw error;
        records = data;
      } else if (role === "member") {
        const { data, error } = await supabase
          .from("attendance")
          .select("status, student_id, students(project_id)")
          .in(
            "students.project_id",
            (
              await supabase
                .from("project_members")
                .select("project_id")
                .eq("user_id", user.id)
            ).data.map((p) => p.project_id)
          );
        if (error) throw error;
        records = data;
      }

      const total = records.length;
      const attended = records.filter((r) => r.status === "Present").length;
      const absences = records.filter((r) => r.status === "Absent").length;
      const attendanceRate = total ? ((attended / total) * 100).toFixed(1) : 0;

      setStats({ totalSessions: total, attended, absences, attendanceRate });
    } catch (err) {
      console.error("Error fetching attendance stats:", err.message);
      setMessage("❌ Failed to fetch attendance stats.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body>
        <h5 className="fw-bold mb-3">Attendance Overview</h5>

        {message && (
          <Alert variant={message.startsWith("✅") ? "success" : "info"}>
            {message}
          </Alert>
        )}

        <Row>
          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="p-3 text-center bg-light shadow-sm border-0">
              <FontAwesomeIcon icon={faCalendarCheck} size="2x" className="text-primary mb-2" />
              <h6>Total Sessions</h6>
              <h4>{stats.totalSessions}</h4>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="p-3 text-center bg-light shadow-sm border-0">
              <FontAwesomeIcon icon={faUserClock} size="2x" className="text-success mb-2" />
              <h6>Attendance Rate</h6>
              <h4>{stats.attendanceRate}%</h4>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="p-3 text-center bg-light shadow-sm border-0">
              <FontAwesomeIcon icon={faUserTimes} size="2x" className="text-danger mb-2" />
              <h6>Absences</h6>
              <h4>{stats.absences}</h4>
            </Card>
          </Col>

          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="p-3 text-center bg-light shadow-sm border-0">
              <FontAwesomeIcon icon={faUserClock} size="2x" className="text-warning mb-2" />
              <h6>Attended</h6>
              <h4>{stats.attended}</h4>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
