import { Navigate } from "react-router-dom";

export default function AdminRoute({ role, children }) {
  if (!role ||role !== "Super Admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
