import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
      <div>{children}</div>
    </div>
  );
}

export default AppLayout;
