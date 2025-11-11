import React from "react";
import { useHistory } from "react-router-dom";
import ProjectSummaryCard from "./projects/ProjectSummaryCard";
import { Button } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderOpen,
  faFileInvoiceDollar,
  faClipboardList,
  faUsers,
  faTasks
} from "@fortawesome/free-solid-svg-icons";
import ProjectsOverview from "./projects/ProjectsOverview";
import CalendarMember from "./calendar/CalendarMember";

export default function DashboardMember() {
  const history = useHistory();

  return (
    <>
      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center py-3">
        <div>
          <Button
            variant="primary"
            size="sm"
            className="me-2"
            onClick={() => history.push("/member/projects/list")}
          >
            <FontAwesomeIcon icon={faFolderOpen} className="me-2" /> View Projects
          </Button>
          <Button
            variant="outline-warning"
            size="sm"
            className="me-2"
            onClick={() => history.push("/member/requisitions/create/1")}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" /> Submit Requisition
          </Button>
          <Button
            variant="outline-info"
            size="sm"
            className="me-2"
            onClick={() => history.push("/member/requisitions/list/1")}
          >
            <FontAwesomeIcon icon={faClipboardList} className="me-2" /> View Requisitions
          </Button>
        </div>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => history.push("/member/attendance/manage/1")}
          >
            <FontAwesomeIcon icon={faTasks} className="me-2" /> Manage Attendance
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => history.push("/member/students/manage/1")}
          >
            <FontAwesomeIcon icon={faUsers} className="me-2" /> Manage Students
          </Button>
        </div>
      </div>
      <div className="mt-4">
  <ProjectSummaryCard role="leader" />
</div>


      {/* Projects Overview */}
      <ProjectsOverview />

      {/* Calendar Section */}
      <div className="mt-5">
        <CalendarMember />
      </div>
    </>
  );
}
