import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Alert,
  Spinner,
  Form,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faSyncAlt,
  faUserCheck,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function AttendanceHistory() {
  const { projectId } = useParams();
  const history = useHistory();

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [totals, setTotals] = useState({ present: 0, absent: 0 });

  useEffect(() => {
    if (projectId) {
      fetchStudents();
      fetchAttendance();
    }
  }, [projectId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("project_id", projectId);

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("Error loading students:", err.message);
    }
  };

  const fetchAttendance = async (dateFilter) => {
    try {
      setLoading(true);
      let query = supabase
        .from("attendance")
        .select("id, student_id, status, date")
        .eq("project_id", projectId)
        .order("date", { ascending: false });

      if (dateFilter) query = query.eq("date", dateFilter);

      const { data, error } = await query;
      if (error) throw error;

      setAttendanceRecords(data || []);
      calculateTotals(data);
    } catch (err) {
      console.error("Error fetching attendance:", err.message);
      setMessage("❌ Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (records) => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    setTotals({ present, absent });
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchAttendance(date);
  };

  const getStudentName = (id) => {
    const student = students.find((s) => s.id === id);
    return student ? student.full_name : "—";
  };

  return (
    <div className="py-4">
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button variant="light" onClick={() => history.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
          </Button>
          <h4 className="fw-bold mt-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
            Attendance History
          </h4>
        </div>

        <div className="text-end">
          <Form.Group className="mb-0">
            <Form.Label className="me-2 fw-bold">Filter by Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{ display: "inline-block", width: "auto" }}
            />
          </Form.Group>
        </div>
      </div>

      {message && (
        <Alert variant={message.startsWith("✅") ? "success" : "danger"} className="mb-3">
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No attendance records found {selectedDate ? `for ${selectedDate}` : ""}.
            </p>
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      <td>{record.date}</td>
                      <td>{getStudentName(record.student_id)}</td>
                      <td>
                        {record.status === "present" ? (
                          <span className="text-success fw-bold">
                            <FontAwesomeIcon icon={faUserCheck} className="me-2" />
                            Present
                          </span>
                        ) : (
                          <span className="text-danger fw-bold">
                            <FontAwesomeIcon icon={faUserTimes} className="me-2" />
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => fetchAttendance(selectedDate)}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className="me-2" />
                    Refresh
                  </Button>
                </div>

                <div className="text-end fw-bold">
                  <span className="text-success me-3">
                    <FontAwesomeIcon icon={faUserCheck} className="me-1" />
                    Present: {totals.present}
                  </span>
                  <span className="text-danger">
                    <FontAwesomeIcon icon={faUserTimes} className="me-1" />
                    Absent: {totals.absent}
                  </span>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
