import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Button,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChartBar } from "@fortawesome/free-solid-svg-icons";
import { useParams, useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AttendanceSummary() {
  const { projectId } = useParams();
  const history = useHistory();

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSummary();
  }, [projectId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status, students(full_name)")
        .eq("project_id", projectId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setSummary([]);
        setLoading(false);
        return;
      }

      // Group by student
      const grouped = {};
      data.forEach((record) => {
        const id = record.student_id;
        if (!grouped[id]) {
          grouped[id] = {
            full_name: record.students?.full_name || "Unknown",
            total_days: 0,
            present_days: 0,
            absent_days: 0,
          };
        }
        grouped[id].total_days++;
        if (record.status === "present") grouped[id].present_days++;
        else if (record.status === "absent") grouped[id].absent_days++;
      });

      // Calculate attendance rate
      const formatted = Object.values(grouped).map((s) => ({
        ...s,
        attendance_rate:
          s.total_days > 0
            ? ((s.present_days / s.total_days) * 100).toFixed(1)
            : 0,
      }));

      setSummary(formatted);
    } catch (err) {
      console.error("Error fetching summary:", err.message);
      setMessage("❌ Failed to load attendance summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="light" onClick={() => history.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
        </Button>
        <h4 className="fw-bold mb-0">
          <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
          Attendance Summary
        </h4>
      </div>

      {message && <Alert variant="danger">{message}</Alert>}

      {/* Table Summary */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : summary.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No attendance data available for this project.
            </p>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Total Days</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.full_name}</td>
                    <td>{s.total_days}</td>
                    <td>{s.present_days}</td>
                    <td>{s.absent_days}</td>
                    <td>{s.attendance_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Bar Chart */}
      {summary.length > 0 && (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h6 className="fw-bold mb-3">Attendance Overview</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="full_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present_days" name="Present" fill="#4caf50" />
                <Bar dataKey="absent_days" name="Absent" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
