import React, { useEffect, useState } from "react";
import {
  Card,
  Spinner,
  Button,
  ListGroup,
  Row,
  Col,
  Badge,
  Alert,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faBell,
  faTrashAlt,
  faEnvelopeOpen,
  faEnvelope,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../../config/supabaseClient";
import { useHistory } from "react-router-dom";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newAlert, setNewAlert] = useState("");
  const [userRole, setUserRole] = useState("");
  const history = useHistory();

  useEffect(() => {
    initNotifications();
  }, []);

  const initNotifications = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) throw new Error("Unauthorized");

      await fetchUserRole(userId);
      await loadNotifications(userId);
      subscribeToRealtime(userId);
    } catch (err) {
      console.error("Error initializing notifications:", err.message);
      setMessage("❌ Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (!error && data) setUserRole(data.role);
  };

  const loadNotifications = async (userId) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    setNotifications(data);
    if (data.length === 0) setMessage("No notifications yet.");
  };

  const subscribeToRealtime = (userId) => {
    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setNewAlert("New notification received");
          setTimeout(() => setNewAlert(""), 2500);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const markAllAsRead = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = async (id, currentStatus) => {
    await supabase.from("notifications").update({ read: !currentStatus }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !currentStatus } : n))
    );
  };

  const clearAll = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return;

    await supabase.from("notifications").delete().eq("user_id", userId);
    setNotifications([]);
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  const navigateToReference = (notification) => {
    const { reference_type, reference_id } = notification;
    if (!reference_type || !reference_id) return;

    const basePath = userRole === "leader" ? "/leader" : "/member";

    switch (reference_type) {
      case "project":
        history.push(`${basePath}/projects/view/${reference_id}`);
        break;
      case "requisition":
        history.push(`${basePath}/requisitions/view/${reference_id}`);
        break;
      default:
        console.warn("Unknown reference type:", reference_type);
    }
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <FontAwesomeIcon icon={faBell} className="me-2 text-primary" />
          Notifications
        </h4>
        <div>
          <Button
            variant="outline-success"
            size="sm"
            className="me-2"
            onClick={markAllAsRead}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Mark All Read
          </Button>
          <Button variant="outline-danger" size="sm" onClick={clearAll}>
            <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Clear All
          </Button>
        </div>
      </div>

      {newAlert && (
        <Alert variant="info" className="py-2 text-center small">
          {newAlert}
        </Alert>
      )}

      {message && (
        <Alert
          variant={message.startsWith("❌") ? "danger" : "info"}
          className="mb-3"
        >
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-muted">No notifications</div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((n) => (
              <ListGroup.Item
                key={n.id}
                className={`border-bottom border-light px-4 py-3 d-flex justify-content-between align-items-start ${
                  n.reference_type ? "cursor-pointer" : ""
                }`}
                style={{
                  backgroundColor: n.read ? "#fff" : "#f8f9fa",
                }}
                onClick={() => navigateToReference(n)}
              >
                <div>
                  <Row>
                    <Col>
                      <h6 className="fw-bold mb-1">
                        <Badge bg={getBadgeColor(n.type)} className="me-2">
                          {n.type?.toUpperCase()}
                        </Badge>
                        {n.title}
                      </h6>
                      <p className="text-muted small mb-1">{n.message}</p>
                      <small className="text-secondary">
                        {new Date(n.created_at).toLocaleString()}
                      </small>
                    </Col>
                  </Row>
                </div>
                <div className="d-flex align-items-center">
                  {n.reference_type && (
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-primary me-2"
                    />
                  )}
                  <Button
                    variant="light"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRead(n.id, n.read);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={n.read ? faEnvelopeOpen : faEnvelope}
                      className={n.read ? "text-secondary" : "text-primary"}
                    />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>
    </div>
  );
}
