import DashboardHomeContent from "@/components/dashboard/DashboardHomeContent";

export const metadata = {
  title: "Home",
};

export default function DashboardHomePage() {
  return (
    <div className="dash-overview-landing">
      <DashboardHomeContent />
    </div>
  );
}
