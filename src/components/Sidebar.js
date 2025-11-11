import React, { useEffect, useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faProjectDiagram,
  faUserGraduate,
  faClipboardCheck,
  faFileInvoiceDollar,
  faCog,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Image, Button, Navbar } from "@themesberg/react-bootstrap";
import { supabase } from "../config/supabaseClient";
import { Routes } from "../routes";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";

export default function Sidebar() {
  const location = useLocation();
  const history = useHistory();
  const { pathname } = location;

  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    if (!currentUser) return;
    setUser(currentUser);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();
    setRole(profile?.role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    history.push(Routes.Signin.path);
  };

  const NavItem = ({ title, icon, link }) => {
    const active = pathname === link ? "active" : "";
    return (
      <Nav.Item className={active}>
        <Nav.Link as={Link} to={link} className="d-flex align-items-center">
          <span className="sidebar-icon">
            <FontAwesomeIcon icon={icon} />
          </span>
          <span className="sidebar-text ms-2">{title}</span>
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      {/* Mobile Navbar */}
      <Navbar
        expand={false}
        collapseOnSelect
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Brand as={Link} to={Routes.Signin.path}>
          <Image src={ReactHero} height={30} />
        </Navbar.Brand>
      </Navbar>

      {/* Sidebar */}
      <SimpleBar className="sidebar d-md-block bg-primary text-white">
        <div className="sidebar-inner px-4 pt-3">
          {/* User Info */}
          <div className="user-card d-flex align-items-center justify-content-between pb-3 border-bottom border-secondary">
            <div className="d-flex align-items-center">
              <div className="user-avatar lg-avatar me-3">
                <Image
                  src={ProfilePicture}
                  className="card-img-top rounded-circle border-white"
                />
              </div>
              <div>
                <h6 className="mb-0 text-white">{user?.email || "User"}</h6>
                <small className="text-light">
                  {role ? role.toUpperCase() : "—"}
                </small>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <Nav className="flex-column pt-4">
            <NavItem
              title="Home"
              icon={faHome}
              link={
                role === "leader"
                  ? Routes.DashboardLeader.path
                  : Routes.DashboardMember.path
              }
            />

            <NavItem
              title="Projects"
              icon={faProjectDiagram}
              link={
                role === "leader"
                  ? Routes.ProjectListLeader.path
                  : Routes.ProjectListMember.path
              }
            />

            <NavItem
              title="Students"
              icon={faUserGraduate}
              link={
                role === "leader"
                  ? "/leader/students/manage/overview"
                  : "/member/students/manage/overview"
              }
            />

            <NavItem
              title="Attendance"
              icon={faClipboardCheck}
              link={
                role === "leader"
                  ? "/leader/attendance/summary/overview"
                  : "/member/attendance/manage/overview"
              }
            />

            <NavItem
              title="Requisitions"
              icon={faFileInvoiceDollar}
              link={
                role === "leader"
                  ? Routes.RequisitionSummary.path
                  : "/member/requisitions/create/overview"
              }
            />

            <NavItem title="Settings" icon={faCog} link={Routes.Settings.path} />

            <div className="mt-4">
              <Button
                variant="outline-light"
                size="sm"
                className="w-100"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Sign Out
              </Button>
            </div>
          </Nav>
        </div>
      </SimpleBar>
    </>
  );
}
