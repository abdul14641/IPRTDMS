import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Alert,
  Spinner,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSyncAlt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

export default function RequisitionListMember() {
  const history = useHistory();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      if (!currentUser) {
        history.push("/examples/sign-in");
        return;
      }

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
          projects (project_name)
        `
        )
        .eq("submitted_by", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequisitions(data);
    } catch (err) {
      console.error("Error loading requisitions:", err.message);
      setMessage("❌ Failed to load requisitions.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequisition = () => {
    history.push("/member/requisitions/create");
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
          My Requisitions
        </h4>
        <div>
          <Button variant="primary" size="sm" className="me-2" onClick={handleNewRequisition}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Requisition
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={fetchRequisitions}>
            <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
            Refresh
          </Button>
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
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : requisitions.length === 0 ? (
            <p className="text-center text-muted mb-0">
              You have not submitted any requisitions yet.
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
