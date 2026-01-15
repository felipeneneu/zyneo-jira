import { DiagramsBoard } from "@/src/features/dev/components/diagrams-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";

export default function DiagramsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagrams</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Create and review system diagrams linked to tasks and epics.
        </CardContent>
      </Card>
      <DiagramsBoard />
    </div>
  );
}
