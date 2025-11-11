import React, { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import Preloader from "../components/Preloader";

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserRole("guest");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole("guest");
      } else {
        setUserRole(data?.role || "guest");
      }

      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) return <Preloader show={true} />;

  if (userRole === "guest") return <Redirect to="/signin" />;

  if (allowedRoles && !allowedRoles.includes(userRole))
    return <Redirect to="/not-found" />;

  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

export default ProtectedRoute;
