import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Alert,
  Spinner,
  Modal,
  Form,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faSyncAlt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../config/supabaseClient";

export default function RequisitionList() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) return;

      // Fetch all requisitions for leader's projects
      const { data, error } = await supabase
        .from("requisitions")
        .select(
          `
          id,
          title,
          description,
          amount,
          status,
          created_at,
          reviewed_at,
          remarks,
          projects (id, project_name, created_by)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter to only projects created by this leader
      const filtered = data.filter(
        (req) => req.projects?.created_by === currentUser.id
      );

      setRequisitions(filtered);
    } catch (err) {
      console.error("Error fetching requisitions:", err.message);
      setMessage("❌ Failed to load requisitions.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req) => {
    try {
      const { error } = await supabase
        .from("requisitions")
        .update({
          status: "approved",
          reviewed_at: new Date(),
          remarks: "Approved by leader",
        })
        .eq("id", req.id);

      if (error) throw error;
      setMessage("✅ Requisition approved successfully.");
      fetchRequisitions();
    } catch (err) {
      console.error("Approval error:", err.message);
      setMessage("❌ Failed to approve requisition.");
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      setMessage("⚠️ Please provide a reason for rejection.");
      return;
    }

    try {
      const { error } = await supabase
        .from("requisitions")
        .update({
          status: "rejected",
          reviewed_at: new Date(),
          remarks,
        })
        .eq("id", selectedReq.id);

      if (error) throw error;
      setMessage("✅ Requisition rejected successfully.");
      setShowModal(false);
      setRemarks("");
      fetchRequisitions();
    } catch (err) {
      console.error("Rejection error:", err.message);
      setMessage("❌ Failed to reject requisition.");
    }
  };

  const openRejectModal = (req) => {
    setSelectedReq(req);
    setShowModal(true);
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
          Project Requisitions
        </h4>
        <Button variant="outline-secondary" size="sm" onClick={fetchRequisitions}>
          <FontAwesomeIcon icon={faSyncAlt} className="me-1" /> Refresh
        </Button>
      </div>

      {message && (
        <Alert
          variant={
            message.startsWith("✅")
              ? "success"
              : message.startsWith("⚠️")
              ? "warning"
              : "danger"
          }
          className="mb-3"
        >
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : requisitions.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No requisitions found for your projects.
            </p>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project</th>
                  <th>Title</th>
                  <th>Amount (RM)</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Reviewed</th>
                  <th>Remarks</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.projects?.project_name || "—"}</td>
                    <td>{r.title}</td>
                    <td>{r.amount?.toFixed(2)}</td>
                    <td>
                      {r.status === "approved" && (
                        <span className="badge bg-success">Approved</span>
                      )}
                      {r.status === "rejected" && (
                        <span className="badge bg-danger">Rejected</span>
                      )}
                      {r.status === "pending" && (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      {r.reviewed_at
                        ? new Date(r.reviewed_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>{r.remarks || "—"}</td>
                    <td className="text-center">
                      {r.status === "pending" ? (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApprove(r)}
                          >
                            <FontAwesomeIcon icon={faCheckCircle} /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openRejectModal(r)}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} /> Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-muted small">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Reject Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Requisition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Remarks (Reason for rejection)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your reason"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
