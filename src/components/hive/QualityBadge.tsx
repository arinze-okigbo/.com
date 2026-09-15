type Report = { auditedAt: string; performance: number; url: string };
async function readReport(): Promise<Report | null> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/arinze-okigbo/.com/hive/metrics/hive/qa/latest-production.json",
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(1500) },
    );
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;
    const report = data as { auditedAt?: string; scores?: { performance?: number }; url?: string };
    if (
      typeof report.scores?.performance !== "number" ||
      report.scores.performance < 0 ||
      report.scores.performance > 100 ||
      (report.url !== "https://arinzeokigbo.com" && report.url !== "https://arinzeokigbo.com/") ||
      typeof report.auditedAt !== "string" ||
      Number.isNaN(Date.parse(report.auditedAt))
    )
      return null;
    return {
      auditedAt: report.auditedAt,
      performance: report.scores.performance,
      url: report.url!,
    };
  } catch {
    return null;
  }
}
export async function QualityBadge() {
  const report = await readReport();
  if (!report) return <AuditLink />;
  return (
    <a
      className="footer-audit"
      title={`Lighthouse performance audit of ${report.url}, measured ${new Date(report.auditedAt).toUTCString()}. Source: published production quality report.`}
      href="https://github.com/arinze-okigbo/.com/tree/hive/metrics/hive/qa"
      target="_blank"
      rel="noreferrer"
    >
      Performance {Math.round(report.performance)} / 100 ·{" "}
      {new Date(report.auditedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })}{" "}
      ↗
    </a>
  );
}
export function AuditLink() {
  return (
    <a
      className="footer-audit"
      href="https://github.com/arinze-okigbo/.com/actions"
      target="_blank"
      rel="noreferrer"
    >
      Performance audit ↗
    </a>
  );
}
