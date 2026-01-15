import { AuditLogTable } from "@/src/features/dev/components/audit-log-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Review changes across tasks, sprints, and releases.
        </CardContent>
      </Card>
      <AuditLogTable />
    </div>
  );
}
