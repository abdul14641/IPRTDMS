import React, { useEffect, useState } from "react";
import {
  Navbar,
  Nav,
  Container,
  Dropdown,
  Image,
  Badge,
  Spinner,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faSignOutAlt,
  faUserCircle,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../config/supabaseClient";
import { useHistory } from "react-router-dom";
import Profile3 from "../assets/img/team/profile-picture-3.jpg";

export default function TopNavbar() {
  const history = useHistory();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initNavbar();
  }, []);

  const initNavbar = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", userId)
        .single();

      if (profile) setUserRole(profile.role);

      loadRecentNotifications(userId);
      subscribeToRealtime(userId);
    } catch (err) {
      console.error("Navbar init error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentNotifications = async (userId) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw error;
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.read).length);
  };

  const subscribeToRealtime = (userId) => {
    const channel = supabase
      .channel("navbar:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 5));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    history.push("/signin");
  };

  const handleViewAll = () => {
    const basePath = userRole === "leader" ? "/leader" : "/member";
    history.push(`${basePath}/notifications`);
  };

  return (
    <Navbar variant="dark" expanded className="ps-0 pe-2 pb-0">
      <Container fluid className="px-0 d-flex justify-content-between align-items-center">
        <Navbar.Brand className="fw-bold text-light">IPRT Dashboard</Navbar.Brand>

        <Nav className="align-items-center">
          <Dropdown as={Nav.Item} align="end">
            <Dropdown.Toggle as={Nav.Link} className="text-dark position-relative">
              <FontAwesomeIcon icon={faBell} size="lg" />
              {unreadCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {unreadCount}
                </Badge>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="notifications-dropdown dropdown-menu-lg dropdown-menu-center mt-2 py-0">
              <Dropdown.Header className="fw-bold py-2 text-center bg-light">
                Notifications
              </Dropdown.Header>

              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-3 text-muted small">
                  No recent notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <Dropdown.Item
                    key={n.id}
                    className={`py-2 small ${
                      n.read ? "text-muted" : "fw-bold text-dark"
                    }`}
                    onClick={() => handleViewAll()}
                  >
                    {n.title}
                    <div className="small text-secondary">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </Dropdown.Item>
                ))
              )}

              <Dropdown.Divider />
              <Dropdown.Item
                className="text-center fw-bold text-primary"
                onClick={handleViewAll}
              >
                View all
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0">
              <div className="media d-flex align-items-center">
                <Image src={Profile3} className="user-avatar md-avatar rounded-circle" />
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
              <Dropdown.Item>
                <FontAwesomeIcon icon={faUserCircle} className="me-2" /> Profile
              </Dropdown.Item>
              <Dropdown.Item>
                <FontAwesomeIcon icon={faCog} className="me-2" /> Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
