import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");

  useEffect(() => {
    if (!token || !accountAddress) {
      let role = "patient";
      role = children.props.role || "patient";
      navigate(`/${role}/signin`, { replace: true });
    }
  }, [token, accountAddress, navigate, children.props.role]);

  return children;
};
