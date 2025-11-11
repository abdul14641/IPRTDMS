import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, Spinner, Alert, OverlayTrigger, Tooltip } from "@themesberg/react-bootstrap";
import { supabase } from "../../../config/supabaseClient";

export default function CalendarLeader() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { data: { session } } = await supabase.auth.getSession();
      const leaderId = session?.user?.id;
      if (!leaderId) throw new Error("Unauthorized");

      const { data: projects, error } = await supabase
        .from("projects")
        .select("id, project_name, start_date, end_date, status")
        .eq("created_by", leaderId);

      if (error) throw error;

      if (!projects.length) {
        setMessage("No projects found.");
        setEvents([]);
        return;
      }

      const formatted = projects.map((p) => ({
        id: p.id,
        title: p.project_name,
        start: p.start_date,
        end: p.start_date,
        allDay: true,
        status: p.status,
        backgroundColor:
          p.status === "completed"
            ? "#a3e635"
            : p.status === "on hold"
            ? "#fde047"
            : "#60a5fa",
        borderColor: "#e2e8f0",
        textColor: "#000",
        extendedProps: {
          duration:
            p.start_date && p.end_date
              ? Math.round(
                  (new Date(p.end_date) - new Date(p.start_date)) /
                    (1000 * 60 * 60 * 24)
                ) + " days"
              : "N/A",
        },
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Error loading projects:", err.message);
      setMessage("❌ Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    const projectId = info.event.id;
    window.location.href = `/leader/projects/view/${projectId}`;
  };

  const renderEventContent = (eventInfo) => {
    const { status, duration } = eventInfo.event.extendedProps;
    const statusBadge =
      status === "completed"
        ? "success"
        : status === "on hold"
        ? "warning"
        : "primary";

    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            <strong>{eventInfo.event.title}</strong>
            <br />
            Status: {status}
            <br />
            Duration: {duration}
          </Tooltip>
        }
      >
        <div className="p-1 rounded-2 text-dark fw-semibold small">
          <span className={`badge bg-${statusBadge} me-1`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {eventInfo.event.title}
        </div>
      </OverlayTrigger>
    );
  };

  return (
    <div className="py-4">
      <h4 className="fw-bold mb-3">Project Calendar</h4>

      {message && (
        <Alert
          variant={message.startsWith("❌") ? "danger" : "info"}
          className="mb-3"
        >
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0 p-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="75vh"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek",
              }}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              eventDisplay="block"
            />

            {/* Color Legend */}
            <div className="d-flex justify-content-center mt-4">
              <div className="d-flex align-items-center mx-3">
                <span
                  style={{
                    width: 15,
                    height: 15,
                    backgroundColor: "#60a5fa",
                    borderRadius: 3,
                    marginRight: 6,
                  }}
                ></span>
                <small>Active</small>
              </div>
              <div className="d-flex align-items-center mx-3">
                <span
                  style={{
                    width: 15,
                    height: 15,
                    backgroundColor: "#fde047",
                    borderRadius: 3,
                    marginRight: 6,
                  }}
                ></span>
                <small>On Hold</small>
              </div>
              <div className="d-flex align-items-center mx-3">
                <span
                  style={{
                    width: 15,
                    height: 15,
                    backgroundColor: "#a3e635",
                    borderRadius: 3,
                    marginRight: 6,
                  }}
                ></span>
                <small>Completed</small>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
