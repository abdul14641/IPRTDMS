import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faSyncAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory, useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function AttendanceVisual() {
  const history = useHistory();
  const { projectId } = useParams();

  const [chartData, setChartData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (projectId) fetchAttendanceData();
  }, [projectId]);

  // ✅ Fetch and prepare attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Get all attendance entries for this project
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status, date, students(full_name)")
        .eq("project_id", projectId);
      if (error) throw error;

      if (!data || data.length === 0) {
        setMessage("⚠️ No attendance data found for visualization.");
        setChartData([]);
        return;
      }

      // Build summary per student
      const studentMap = {};
      data.forEach((entry) => {
        const name = entry.students?.full_name || "Unknown";
        if (!studentMap[name]) studentMap[name] = { Present: 0, Absent: 0, Late: 0 };
        studentMap[name][entry.status] = (studentMap[name][entry.status] || 0) + 1;
      });

      const summary = Object.keys(studentMap).map((name) => ({
        name,
        Present: studentMap[name].Present,
        Absent: studentMap[name].Absent,
        Late: studentMap[name].Late,
      }));

      setChartData(summary);

      // Build trend by date
      const dateMap = {};
      data.forEach((entry) => {
        if (!dateMap[entry.date])
          dateMap[entry.date] = { date: entry.date, Present: 0, Absent: 0, Late: 0 };
        dateMap[entry.date][entry.status]++;
      });

      const trend = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
      setTrendData(trend);
    } catch (err) {
      console.error("Error fetching attendance visualization:", err.message);
      setMessage("❌ Failed to load attendance visualization data.");
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

  return (
    <div className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button variant="light" onClick={() => history.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
          </Button>
          <h4 className="fw-bold mt-3">
            <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
            Attendance Visualization
          </h4>
        </div>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchAttendanceData}
          >
            <FontAwesomeIcon icon={faSyncAlt} className="me-1" /> Refresh
          </Button>
        </div>
      </div>

      {message && (
        <Alert
          variant={message.startsWith("✅") ? "success" : "info"}
          className="mb-4"
        >
          {message}
        </Alert>
      )}

      {chartData.length === 0 ? (
        <p className="text-center text-muted mb-0">
          No attendance records available.
        </p>
      ) : (
        <>
          {/* Bar Chart — Student Summary */}
          <Row className="mb-4">
            <Col xs={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Attendance Summary by Student</h5>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" stackId="a" fill="#28a745" />
                      <Bar dataKey="Late" stackId="a" fill="#ffc107" />
                      <Bar dataKey="Absent" stackId="a" fill="#dc3545" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Line Chart — Attendance Trend */}
          <Row>
            <Col xs={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Attendance Trend by Date</h5>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Present" stroke="#28a745" />
                      <Line type="monotone" dataKey="Absent" stroke="#dc3545" />
                      <Line type="monotone" dataKey="Late" stroke="#ffc107" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
