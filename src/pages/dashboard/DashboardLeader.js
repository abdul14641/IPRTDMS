import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ProjectSummaryCard from "./projects/ProjectSummaryCard";
import { Button, Spinner } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUsers,
  faProjectDiagram,
  faFileInvoiceDollar,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import ProjectsOverview from "./projects/ProjectsOverview";
import CalendarLeader from "./calendar/CalendarLeader";   // ✅ simple import
import { supabase } from "../../config/supabaseClient";

export default function DashboardLeader() {
  const history = useHistory();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequisitions();
    const interval = setInterval(fetchPendingRequisitions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequisitions = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("created_by", userId);

      const projectIds = (projects || []).map(p => p.id);
      if (!projectIds.length) {
        setPendingCount(0);
        return;
      }

      const { count } = await supabase
        .from("requisitions")
        .select("id", { count: "exact", head: true })
        .in("project_id", projectIds)
        .eq("status", "pending");

      setPendingCount(count || 0);
    } catch {
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center py-3">
        <div>
          <Button
            variant="primary"
            size="sm"
            className="me-2"
            onClick={() => history.push("/leader/projects/create")}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" /> New Project
          </Button>

          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => history.push("/leader/projects/list")}
          >
            <FontAwesomeIcon icon={faProjectDiagram} className="me-2" /> View Projects
          </Button>

          <Button
            variant="outline-warning"
            size="sm"
            className="me-2"
            onClick={() => history.push("/leader/requisitions/list")}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                Manage Requisitions{" "}
                {pendingCount > 0 && (
                  <span className="badge bg-danger ms-1">{pendingCount}</span>
                )}
              </>
            )}
          </Button>

          <Button
            variant="outline-info"
            size="sm"
            onClick={() => history.push("/leader/requisitions/summary")}
          >
            <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Requisition Summary
          </Button>
        </div>
        <div className="mt-4">
  <ProjectSummaryCard role="leader" />
</div>


        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => history.push("/leader/projects/members")}
        >
          <FontAwesomeIcon icon={faUsers} className="me-2" /> Team Members
        </Button>
      </div>

      <ProjectsOverview />

      <div className="mt-5">
        <CalendarLeader />
      </div>
    </>
  );
}
