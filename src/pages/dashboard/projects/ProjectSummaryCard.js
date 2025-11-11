import React, { useEffect, useState } from "react";
import { Card, Spinner } from "@themesberg/react-bootstrap";
import { supabase } from "../../../config/supabaseClient";

export default function ProjectSummaryCard({ role = "leader" }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestProject();
  }, []);

  const fetchLatestProject = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      let query = supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(1);

      if (role === "leader") {
        query = query.eq("created_by", userId);
      } else {
        const { data: membership } = await supabase
          .from("project_members")
          .select("project_id")
          .eq("user_id", userId)
          .limit(1);
        if (membership?.length) {
          query = query.eq("id", membership[0].project_id);
        } else {
          setProject(null);
          return;
        }
      }

      const { data, error } = await query.single();
      if (error) throw error;
      setProject(data);
    } catch (err) {
      console.error("Error loading project summary:", err.message);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-0 p-4 text-center">
        <Spinner animation="border" variant="primary" />
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="shadow-sm border-0 p-4 text-center text-muted">
        No recent project found.
      </Card>
    );
  }

  const start = project.start_date ? new Date(project.start_date) : null;
  const end = project.end_date ? new Date(project.end_date) : null;
  const days = start && end ? Math.round((end - start) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card className="shadow-sm border-0 p-4">
      <h5 className="fw-bold mb-3">{project.project_name}</h5>
      <p className="text-muted mb-1">Status: <strong>{project.status}</strong></p>
      {start && end && (
        <p className="text-muted mb-1">
          Duration: {start.toLocaleDateString()} - {end.toLocaleDateString()} ({days} days)
        </p>
      )}
      <p className="text-muted mb-0">
        {project.description
          ? project.description
          : "Project is currently in progress. Review tasks and attendance regularly to ensure timely completion."}
      </p>
    </Card>
  );
}
