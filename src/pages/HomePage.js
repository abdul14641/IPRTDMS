import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";
import { supabase } from "../config/supabaseClient";

// Layout Components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";

// Pages
import Presentation from "./Presentation";
import Signin from "./examples/Signin";
import Signup from "./examples/Signup";
import ForgotPassword from "./examples/ForgotPassword";
import DashboardOverview from "./dashboard/DashboardOverview";
import DashboardLeader from "./dashboard/DashboardLeader";
import DashboardMember from "./dashboard/DashboardMember";
import NotFoundPage from "./examples/NotFound";

// Project Pages
import ProjectCreate from "./dashboard/projects/ProjectCreate";
import ProjectList from "./dashboard/projects/ProjectsList";
import ProjectMembers from "./dashboard/projects/ProjectMembers";

// Student Pages
import StudentManage from "./dashboard/students/StudentManage";
import StudentAdd from "./dashboard/students/StudentAdd";
import StudentList from "./dashboard/students/StudentsList";
import StudentEdit from "./dashboard/students/StudentEdit";
import StudentView from "./dashboard/students/StudentView";

// Attendance Pages
import AttendanceManage from "./dashboard/attendance/AttendanceManage";
import AttendanceHistory from "./dashboard/attendance/AttendanceHistory";
import AttendanceSummary from "./dashboard/attendance/AttendanceSummary";

// Requisition Pages
import RequisitionCreate from "./dashboard/requisitions/RequisitionCreate";
import RequisitionList from "./dashboard/requisitions/RequisitionList";
import RequisitionView from "./dashboard/requisitions/RequisitionView";
import RequisitionSummary from "./dashboard/requisitions/RequisitionSummary";

import NotificationCenter from "./dashboard/notifications/NotificationCenter";

/* ==============================================================
   ROUTE WITH LOADER
============================================================== */
const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={!loaded} />
          <Component {...props} />
        </>
      )}
    />
  );
};

/* ==============================================================
   ROUTE WITH SIDEBAR
============================================================== */
const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem("settingsVisible", !showSettings);
  };

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={!loaded} />
          <Sidebar />
          <main className="content">
            <Navbar />
            <Component {...props} />
            <Footer toggleSettings={toggleSettings} showSettings={showSettings} />
          </main>
        </>
      )}
    />
  );
};

/* ==============================================================
   PROTECTED ROUTE (Authentication + Role Check)
============================================================== */
const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setUserRole("guest");
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        setUserRole(profile?.role || "guest");
      } catch (err) {
        console.error("Error fetching user role:", err.message);
        setUserRole("guest");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) return <Preloader show={true} />;
  if (userRole === "guest") return <Redirect to={Routes.Signin.path} />;
  if (allowedRoles && !allowedRoles.includes(userRole))
    return <Redirect to={Routes.NotFound.path} />;

  return <RouteWithSidebar component={Component} {...rest} />;
};

/* ==============================================================
   MAIN APP ROUTES
============================================================== */
export default function HomePage() {
  return (
    <Switch>
      {/* Default Redirect */}
      <Redirect exact from="/" to={Routes.Signin.path} />

      {/* Public Routes */}
      <RouteWithLoader exact path={Routes.Presentation.path} component={Presentation} />
      <RouteWithLoader exact path={Routes.Signin.path} component={Signin} />
      <RouteWithLoader exact path={Routes.Signup.path} component={Signup} />
      <RouteWithLoader exact path={Routes.ForgotPassword.path} component={ForgotPassword} />

      {/* ==========================================================
         LEADER ROUTES
      ========================================================== */}
      <ProtectedRoute
        exact
        path="/leader/dashboard"
        component={DashboardLeader}
        allowedRoles={["leader"]}
      />
      <ProtectedRoute
        exact
        path="/leader/projects/create"
        component={ProjectCreate}
        allowedRoles={["leader"]}
      />
      <ProtectedRoute
        exact
        path="/leader/projects/list"
        component={ProjectList}
        allowedRoles={["leader"]}
      />
      <ProtectedRoute
        exact
        path="/leader/projects/members"
        component={ProjectMembers}
        allowedRoles={["leader"]}
      />

      {/* Leader: Students */}
      <ProtectedRoute
        exact
        path="/leader/students/manage/:projectId"
        component={StudentManage}
        allowedRoles={["leader"]}
      />
      <ProtectedRoute
        exact
        path="/leader/students/view/:projectId/:id"
        component={StudentView}
        allowedRoles={["leader"]}
      />

      {/* Leader: Attendance */}
      <ProtectedRoute
        exact
        path="/leader/attendance/history/:projectId"
        component={AttendanceHistory}
        allowedRoles={["leader"]}
      />
      <ProtectedRoute
        exact
        path="/leader/attendance/summary/:projectId"
        component={AttendanceSummary}
        allowedRoles={["leader"]}
      />

      {/* Leader: Requisition (✅ Added List Page) */}
      <ProtectedRoute
        exact
        path="/leader/requisitions/list"
        component={RequisitionList}
        allowedRoles={["leader"]}
      />
      <ProtectedRoute
        exact
        path="/leader/requisitions/summary"
        component={RequisitionSummary}
        allowedRoles={["leader"]}
      />
      <ProtectedRoute
        exact
        path="/leader/requisitions/view/:projectId/:id"
        component={RequisitionView}
        allowedRoles={["leader"]}
      />

      {/* ==========================================================
         MEMBER ROUTES
      ========================================================== */}
      <ProtectedRoute
        exact
        path="/member/dashboard"
        component={DashboardMember}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
  exact
  path="/notifications"
  component={NotificationCenter}
  allowedRoles={["leader", "member"]}
/>

      <ProtectedRoute
        exact
        path="/member/projects/list"
        component={ProjectList}
        allowedRoles={["member"]}
      />

      {/* Member: Students */}
      <ProtectedRoute
        exact
        path="/member/students/manage/:projectId"
        component={StudentManage}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/students/add/:projectId"
        component={StudentAdd}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/students/list/:projectId"
        component={StudentList}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/students/edit/:projectId/:id"
        component={StudentEdit}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/students/view/:projectId/:id"
        component={StudentView}
        allowedRoles={["member"]}
      />

      {/* Member: Attendance */}
      <ProtectedRoute
        exact
        path="/member/attendance/manage/:projectId"
        component={AttendanceManage}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/attendance/history/:projectId"
        component={AttendanceHistory}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/attendance/summary/:projectId"
        component={AttendanceSummary}
        allowedRoles={["member"]}
      />

      {/* Member: Requisitions */}
      <ProtectedRoute
        exact
        path="/member/requisitions/create/:projectId"
        component={RequisitionCreate}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/requisitions/list/:projectId"
        component={RequisitionList}
        allowedRoles={["member"]}
      />
      <ProtectedRoute
        exact
        path="/member/requisitions/view/:projectId/:id"
        component={RequisitionView}
        allowedRoles={["member"]}
      />

      {/* Shared Overview */}
      <ProtectedRoute
        exact
        path={Routes.DashboardOverview.path}
        component={DashboardOverview}
        allowedRoles={["leader", "member"]}
      />

      {/* 404 Catch-All */}
      <RouteWithLoader path="*" component={NotFoundPage} />
    </Switch>
  );
}
