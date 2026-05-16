import { DASH } from "@/components/dashboard/dashboard-ui";

export default function PageHeader({ icon: Icon, title, lead, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className={DASH.titleRow}>
        {Icon ? (
          <div className={DASH.iconBox}>
            <Icon strokeWidth={1.75} aria-hidden />
          </div>
        ) : null}
        <div>
          <h1 className={DASH.h1}>{title}</h1>
          {lead ? <p className={DASH.lead}>{lead}</p> : null}
        </div>
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
