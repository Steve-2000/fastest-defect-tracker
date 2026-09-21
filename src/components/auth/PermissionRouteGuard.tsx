import React from "react";
import { AccessDenied } from "../../pages/AccessDenied";
import { usePermission } from "../../context/PermissionContext";

interface Props {
  children: React.ReactNode;
  permission?: boolean;
}

const PermissionRouteGuard: React.FC<Props> = ({ children, permission }) => {
  const { permissionsReady, isLoading } = usePermission();

  // If explicit permission boolean is provided and false, render AccessDenied
  if (permission !== undefined && !permission) {
    // If permissions are still loading initially, allow a moment
    if (isLoading && !permissionsReady) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      );
    }
    return <AccessDenied />;
  }

  return <>{children}</>;
};

export default PermissionRouteGuard;