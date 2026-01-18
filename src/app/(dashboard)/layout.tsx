import { CreateWorkspaceModal } from "@/src/features/workspaces/components/create-workspace-modal";
import { CreateProjectModal } from "@/src/features/projects/components/create-project-modal";
import { CreateTaskModal } from "@/src/features/tasks/components/create-task-modal";

import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";
import { EditTaskModal } from "@/src/features/tasks/components/edit-task-modal";
import Header from "../components/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden lg:block lg:w-66 h-full overflow-y-auto">
          <Sidebar />
        </div>
        <div className="lg:pl-66 w-full">
          <div className="mx-auto max-w-screen-2xl h-full">
            <Header />
            <Navbar />
            <main className="h-full py-8 px-6 flex flex-col">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
