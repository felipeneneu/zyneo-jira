import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { Task } from "../types";
import { TaskStatus } from "../types";

export type TaskReportInsights = {
  overview: string;
  strengths: string[];
  improvements: string[];
  attention: string[];
  actions: string[];
};

type ReportSummary = {
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
};

const toRgb = (value: string, fallback: [number, number, number]) => {
  if (!value) return fallback;
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return fallback;
  return [Number(match[1]), Number(match[2]), Number(match[3])] as [
    number,
    number,
    number
  ];
};

const resolveCssColor = (varName: string, fallback: [number, number, number]) => {
  if (typeof window === "undefined") return fallback;
  const computed = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!computed) return fallback;
  const probe = document.createElement("span");
  probe.style.color = computed;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return toRgb(rgb, fallback);
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
};

const computeSummary = (tasks: Task[]): ReportSummary => {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS" || task.status === "IN_REVIEW"
  ).length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter((task) => {
    if (!task.dueDate) return false;
    if (task.status === "DONE") return false;
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
  return { total, done, inProgress, overdue };
};

const loadLogoAsPng = async () => {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch("/logo.svg");
    const svgText = await response.text();
    const svgBase64 = btoa(svgText);
    const svgUrl = `data:image/svg+xml;base64,${svgBase64}`;

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Logo load failed"));
      img.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.width || 320;
    canvas.height = image.height || 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
};

const countByStatus = (tasks: Task[]) =>
  tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {});

const countDueHealth = (tasks: Task[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueSoonLimit = new Date(today);
  dueSoonLimit.setDate(today.getDate() + 3);

  return tasks.reduce(
    (acc, task) => {
      if (task.status === TaskStatus.DONE) {
        return acc;
      }
      if (!task.dueDate) {
        acc.noDueDate += 1;
        return acc;
      }
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due < today) acc.overdue += 1;
      else if (due.getTime() === today.getTime()) acc.dueToday += 1;
      else if (due <= dueSoonLimit) acc.dueSoon += 1;
      else acc.onTrack += 1;
      return acc;
    },
    { overdue: 0, dueToday: 0, dueSoon: 0, onTrack: 0, noDueDate: 0 }
  );
};

const drawSectionTitle = (doc: jsPDF, title: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(title, 72, y);
};

const drawBulletList = (doc: jsPDF, items: string[], y: number) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  let cursorY = y;
  items.forEach((item) => {
    const lines = doc.splitTextToSize(`• ${item}`, 460);
    doc.text(lines, 80, cursorY);
    cursorY += lines.length * 14;
  });
  return cursorY;
};

const drawParagraph = (doc: jsPDF, text: string, y: number) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text, 460);
  doc.text(lines, 72, y);
  return y + lines.length * 14;
};

const drawBarChart = (doc: jsPDF, params: {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  labels: string[];
  values: number[];
  colors: [number, number, number][];
}) => {
  const { title, x, y, width, height, labels, values, colors } = params;
  const maxValue = Math.max(...values, 1);
  const chartTop = y + 18;
  const chartHeight = height - 28;
  const chartWidth = width - 10;
  const barWidth = chartWidth / Math.max(labels.length, 1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(45, 45, 45);
  doc.text(title, x, y);

  doc.setDrawColor(220, 220, 220);
  doc.line(x, chartTop + chartHeight, x + chartWidth, chartTop + chartHeight);

  labels.forEach((label, index) => {
    const value = values[index] ?? 0;
    const barHeight = (value / maxValue) * (chartHeight - 10);
    const barX = x + index * barWidth + 2;
    const barY = chartTop + chartHeight - barHeight;
    const [r, g, b] = colors[index] ?? [90, 90, 90];

    doc.setFillColor(r, g, b);
    doc.rect(barX, barY, barWidth - 6, barHeight, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(String(value), barX, barY - 4);
    doc.text(label, barX, chartTop + chartHeight + 12);
  });
};

export const generateTasksReport = async (
  tasks: Task[],
  insights?: TaskReportInsights
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const primary = resolveCssColor("--primary", [20, 20, 20]);
  const muted = resolveCssColor("--muted-foreground", [110, 110, 110]);
  const border = resolveCssColor("--border", [220, 220, 220]);

  const logoDataUrl = await loadLogoAsPng();

  const summary = computeSummary(tasks);

  doc.setFillColor(255, 255, 255);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Relatório Semanal de Tarefas", 72, 72);

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", 420, 40, 120, 40);
    } catch {}
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(
    `Total: ${summary.total} | Em andamento: ${summary.inProgress} | Concluídas: ${summary.done} | Atrasadas: ${summary.overdue}`,
    72,
    96
  );

  let cursorY = 120;

  if (insights) {
    drawSectionTitle(doc, "Overview de desempenho (IA)", cursorY);
    cursorY = drawParagraph(doc, insights.overview, cursorY + 18) + 4;

    drawSectionTitle(doc, "Pontos fortes", cursorY);
    cursorY = drawBulletList(doc, insights.strengths, cursorY + 16) + 4;

    drawSectionTitle(doc, "Pontos para melhorar", cursorY);
    cursorY = drawBulletList(doc, insights.improvements, cursorY + 16) + 4;

    drawSectionTitle(doc, "Atenção imediata", cursorY);
    cursorY = drawBulletList(doc, insights.attention, cursorY + 16) + 4;

    drawSectionTitle(doc, "Ações recomendadas", cursorY);
    cursorY = drawBulletList(doc, insights.actions, cursorY + 16) + 10;
  }

  const statusCounts = countByStatus(tasks);
  const dueHealth = countDueHealth(tasks);
  const chartHeight = 140;
  const chartWidth = 220;
  const chartGap = 24;

  if (cursorY + chartHeight + 40 > doc.internal.pageSize.height) {
    doc.addPage();
    cursorY = 72;
  }

  drawSectionTitle(doc, "Gráficos de desempenho", cursorY);
  drawBarChart(doc, {
    title: "Distribuição por status",
    x: 72,
    y: cursorY + 18,
    width: chartWidth,
    height: chartHeight,
    labels: ["BACK", "TODO", "PROG", "REV", "READY", "DONE"],
    values: [
      statusCounts[TaskStatus.BACKLOG] ?? 0,
      statusCounts[TaskStatus.TODO] ?? 0,
      statusCounts[TaskStatus.IN_PROGRESS] ?? 0,
      statusCounts[TaskStatus.IN_REVIEW] ?? 0,
      statusCounts[TaskStatus.READY] ?? 0,
      statusCounts[TaskStatus.DONE] ?? 0,
    ],
    colors: [
      [120, 120, 120],
      [75, 123, 229],
      [245, 153, 66],
      [240, 91, 95],
      [60, 179, 113],
      [34, 197, 94],
    ],
  });

  drawBarChart(doc, {
    title: "Saúde de prazos",
    x: 72 + chartWidth + chartGap,
    y: cursorY + 18,
    width: chartWidth,
    height: chartHeight,
    labels: ["ATR", "HOJE", "3D", "OK", "SEM"],
    values: [
      dueHealth.overdue,
      dueHealth.dueToday,
      dueHealth.dueSoon,
      dueHealth.onTrack,
      dueHealth.noDueDate,
    ],
    colors: [
      [230, 57, 70],
      [246, 173, 85],
      [56, 189, 248],
      [16, 185, 129],
      [156, 163, 175],
    ],
  });

  cursorY += chartHeight + 40;

  const tableBody = tasks.map((task) => [
    task.taskKey ? `${task.taskKey} - ${task.name}` : task.name,
    task.status,
    formatDate(task.dueDate),
    task.completedAt ? formatDate(task.completedAt) : "-",
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [["Título", "Status", "Prazo", "Conclusão"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      lineColor: border,
      lineWidth: 0.5,
    },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: [45, 45, 45],
      lineColor: border,
      lineWidth: 0.5,
    },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height || 842;
      const pageWidth = doc.internal.pageSize.width || 595;
      const pageNumber = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(muted[0], muted[1], muted[2]);
      doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
        data.settings.margin.left,
        pageHeight - 24
      );
      doc.text(
        `Página ${pageNumber}`,
        pageWidth - 100,
        pageHeight - 24
      );
    },
  });

  doc.save(`relatorio-tarefas-${new Date().toISOString().slice(0, 10)}.pdf`);
};
