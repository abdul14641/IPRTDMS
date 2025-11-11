import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
  faFileInvoiceDollar,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory, useParams } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function RequisitionView() {
  const history = useHistory();
  const { projectId, id } = useParams();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserAndRequisition();
  }, [id]);

  const fetchUserAndRequisition = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }
      setUser(currentUser);

      const { data: profile, error: roleError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", currentUser.id)
        .single();

      if (roleError) throw roleError;
      setRole(profile.role);

      const { data, error } = await supabase
        .from("requisitions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setRequisition(data);
    } catch (err) {
      console.error("Error loading requisition:", err.message);
      setMessage("❌ Failed to load requisition details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure to mark as ${newStatus}?`)) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from("requisitions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setRequisition((prev) => ({ ...prev, status: newStatus }));
      setMessage(`✅ Requisition marked as ${newStatus}.`);
    } catch (err) {
      console.error("Error updating requisition:", err.message);
      setMessage("❌ Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge bg="success">Approved</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!requisition)
    return (
      <Alert variant="info" className="text-center mt-4">
        No requisition found.
      </Alert>
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
            <FontAwesomeIcon
              icon={faFileInvoiceDollar}
              className="me-2 text-primary"
            />
            Requisition Details
          </h4>
        </div>
      </div>

      {message && (
        <Alert
          variant={message.startsWith("✅") ? "success" : "danger"}
          className="mb-3"
        >
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="mb-3">
            <h5 className="fw-bold">{requisition.title}</h5>
            {getStatusBadge(requisition.status)}
          </div>

          <p className="text-muted mb-2">
            <strong>Description:</strong>
          </p>
          <p>{requisition.description || "No description provided."}</p>

          <p className="mb-1">
            <strong>Amount:</strong> RM {requisition.amount?.toFixed(2)}
          </p>
          <p className="mb-1">
            <strong>Priority:</strong>{" "}
            <span className="text-capitalize">{requisition.priority}</span>
          </p>
          <p className="mb-1">
            <strong>Date Submitted:</strong>{" "}
            {new Date(requisition.created_at).toLocaleDateString()}
          </p>
          <p className="mb-1">
            <strong>Project ID:</strong> {requisition.project_id}
          </p>
          <p className="mb-0">
            <strong>Created By:</strong> {requisition.created_by}
          </p>
        </Card.Body>
      </Card>

      {/* Leader Actions */}
      {role === "leader" && requisition.status === "pending" && (
        <div className="text-end mt-4">
          <Button
            variant="success"
            size="sm"
            className="me-2"
            onClick={() => handleStatusUpdate("approved")}
            disabled={updating}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleStatusUpdate("rejected")}
            disabled={updating}
          >
            <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
