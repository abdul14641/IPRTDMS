import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabaseClient";
import Preloader from "../../components/Preloader";
import DashboardLeader from "./DashboardLeader";
import DashboardMember from "./DashboardMember";

export default function DashboardOverview() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/signin";
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
      } else {
        setRole(data.role);
      }

      setLoading(false);
    };

    fetchRole();
  }, []);

  if (loading) return <Preloader show={true} />;

  return (
    <>
      {role === "leader" && <DashboardLeader />}
      {role === "member" && <DashboardMember />}
    </>
  );
}
