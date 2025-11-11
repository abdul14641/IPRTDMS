import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Alert } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faCheckCircle, faTimesCircle, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../config/supabaseClient";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function RequisitionSummary() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Get current leader
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const leaderId = session?.user?.id;
      if (!leaderId) throw new Error("Unauthorized");

      // Fetch leader’s projects
      const { data: projects, error: projError } = await supabase
        .from("projects")
        .select("id, project_name")
        .eq("created_by", leaderId);

      if (projError) throw projError;

      if (!projects.length) {
        setMessage("⚠️ No projects found under your leadership.");
        setData([]);
        return;
      }

      const projectIds = projects.map((p) => p.id);

      // Fetch requisitions linked to those projects
      const { data: requisitions, error: reqError } = await supabase
        .from("requisitions")
        .select("project_id, amount, status")
        .in("project_id", projectIds);

      if (reqError) throw reqError;

      if (!requisitions.length) {
        setMessage("No requisitions found for your projects.");
        setData([]);
        return;
      }

      // Compute summary
      let total = requisitions.length;
      let approved = requisitions.filter((r) => r.status === "approved").length;
      let pending = requisitions.filter((r) => r.status === "pending").length;
      let rejected = requisitions.filter((r) => r.status === "rejected").length;
      let totalAmount = requisitions.reduce((sum, r) => sum + (r.amount || 0), 0);

      // Compute per-project stats
      const projectStats = projects.map((p) => {
        const projectReqs = requisitions.filter((r) => r.project_id === p.id);
        const totalAmt = projectReqs.reduce((sum, r) => sum + (r.amount || 0), 0);
        return {
          project_name: p.project_name,
          total: projectReqs.length,
          amount: totalAmt,
        };
      });

      setSummary({ total, approved, pending, rejected, totalAmount });
      setData(projectStats);
    } catch (err) {
      console.error("Error loading summary:", err.message);
      setMessage("❌ Failed to load requisition summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      <h4 className="fw-bold mb-3">
        <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
        Requisition Summary
      </h4>

      {message && (
        <Alert
          variant={message.startsWith("❌") ? "danger" : "info"}
          className="mb-4"
        >
          {message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <Card className="shadow-sm border-0 text-center p-3">
                <FontAwesomeIcon icon={faClipboardList} className="text-primary fs-3 mb-2" />
                <h6>Total Requests</h6>
                <h5 className="fw-bold">{summary.total}</h5>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="shadow-sm border-0 text-center p-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-3 mb-2" />
                <h6>Approved</h6>
                <h5 className="fw-bold">{summary.approved}</h5>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="shadow-sm border-0 text-center p-3">
                <FontAwesomeIcon icon={faHourglassHalf} className="text-warning fs-3 mb-2" />
                <h6>Pending</h6>
                <h5 className="fw-bold">{summary.pending}</h5>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="shadow-sm border-0 text-center p-3">
                <FontAwesomeIcon icon={faTimesCircle} className="text-danger fs-3 mb-2" />
                <h6>Rejected</h6>
                <h5 className="fw-bold">{summary.rejected}</h5>
              </Card>
            </div>
          </div>

          {/* Chart */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Requisition Amount by Project (RM)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="project_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#4e73df" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* Table */}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="fw-bold mb-3">Detailed Breakdown</h5>
              <Table hover responsive className="align-items-center">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Project</th>
                    <th>Total Requests</th>
                    <th>Total Amount (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{p.project_name}</td>
                      <td>{p.total}</td>
                      <td>{p.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
