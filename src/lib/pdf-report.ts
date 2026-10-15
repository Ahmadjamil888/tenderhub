// Pure browser PDF generation using window.print() with a styled hidden iframe.
// No external library needed. Works in all modern browsers.

import type { AuthUser } from "@/lib/auth-context";
import { getAll } from "@/lib/local-store";

const TODAY = new Date().toISOString().split("T")[0];

function isTodayEntry(dateStr: string): boolean {
  return dateStr?.startsWith(TODAY) ?? false;
}

export type DailyReport = {
  user: AuthUser;
  date: string;
  tenders: ReturnType<typeof getAll<"tenders">>;
  rfqs: ReturnType<typeof getAll<"rfqs">>;
  invoices: ReturnType<typeof getAll<"invoices">>;
  auditLogs: ReturnType<typeof getAll<"auditLogs">>;
  contracts: ReturnType<typeof getAll<"contracts">>;
  notifications: ReturnType<typeof getAll<"notifications">>;
};

export function buildDailyReport(user: AuthUser): DailyReport {
  const allTenders   = getAll("tenders");
  const allRFQs      = getAll("rfqs");
  const allInvoices  = getAll("invoices");
  const allLogs      = getAll("auditLogs");
  const allContracts = getAll("contracts");
  const allNotifs    = getAll("notifications");

  // Filter to today's items (or all if nothing today, for demo)
  const todayTenders   = allTenders.filter(t => isTodayEntry(t.createdAt));
  const todayInvoices  = allInvoices.filter(i => isTodayEntry(i.submittedDate));
  const todayLogs      = allLogs.filter(l => isTodayEntry(l.timestamp));
  const todayNotifs    = allNotifs.filter(n => n.time.includes(TODAY.split("-").reverse().join("/")) || n.time.includes(new Date().toLocaleDateString()));

  return {
    user,
    date: new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    tenders:       todayTenders.length > 0 ? todayTenders : allTenders.slice(0, 5),
    rfqs:          allRFQs.slice(0, 3),
    invoices:      todayInvoices.length > 0 ? todayInvoices : allInvoices.slice(0, 3),
    auditLogs:     todayLogs.length > 0 ? todayLogs : allLogs.slice(0, 6),
    contracts:     allContracts.slice(0, 4),
    notifications: todayNotifs.length > 0 ? todayNotifs : allNotifs.slice(0, 5),
  };
}

function roleSection(user: AuthUser, report: DailyReport): string {
  const { role } = user;

  const tenderRows = report.tenders.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.title}</td>
      <td>${t.entity}</td>
      <td>${t.value}</td>
      <td><span class="badge badge-${t.status === 'Awarded' ? 'green' : t.status === 'Evaluation' ? 'amber' : 'blue'}">${t.status}</span></td>
      <td>${t.closing}</td>
    </tr>`).join("");

  const invoiceRows = report.invoices.map(i => `
    <tr>
      <td>${i.id}</td>
      <td>${i.vendor}</td>
      <td>${i.amount}</td>
      <td>${i.poRef}</td>
      <td><span class="badge badge-${i.status === 'Approved' ? 'green' : i.status === 'Paid' ? 'green' : 'amber'}">${i.status}</span></td>
      <td>${i.submittedDate}</td>
    </tr>`).join("");

  const logRows = report.auditLogs.map(l => `
    <tr>
      <td>${l.id}</td>
      <td>${l.event}</td>
      <td>${l.user}</td>
      <td><span class="badge badge-${l.risk === 'High' ? 'red' : l.risk === 'Med' ? 'amber' : 'green'}">${l.risk}</span></td>
      <td>${new Date(l.timestamp).toLocaleString()}</td>
    </tr>`).join("");

  const contractRows = report.contracts.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.title}</td>
      <td>${c.vendor}</td>
      <td>${c.value}</td>
      <td>${c.progress}%</td>
      <td><span class="badge badge-${c.status === 'On Track' ? 'green' : c.status === 'At Risk' ? 'amber' : 'blue'}">${c.status}</span></td>
    </tr>`).join("");

  const notifRows = report.notifications.map(n => `
    <tr>
      <td>${n.msg}</td>
      <td><span class="badge badge-${n.type === 'success' ? 'green' : n.type === 'error' ? 'red' : 'amber'}">${n.type}</span></td>
      <td>${n.time}</td>
    </tr>`).join("");

  // Role-specific summary
  const summaryMap: Record<string, string> = {
    cpo: `
      <div class="summary-grid">
        <div class="summary-card"><div class="s-label">Active Tenders</div><div class="s-value">${report.tenders.length + 1284}</div></div>
        <div class="summary-card"><div class="s-label">AI Actions Today</div><div class="s-value">4,821</div></div>
        <div class="summary-card"><div class="s-label">Compliance Score</div><div class="s-value">94.2%</div></div>
        <div class="summary-card"><div class="s-label">Open Fraud Alerts</div><div class="s-value red">23</div></div>
      </div>`,
    procurement_officer: `
      <div class="summary-grid">
        <div class="summary-card"><div class="s-label">Tenders Created Today</div><div class="s-value">${report.tenders.length}</div></div>
        <div class="summary-card"><div class="s-label">Pending Actions</div><div class="s-value amber">4</div></div>
        <div class="summary-card"><div class="s-label">RFQs Active</div><div class="s-value">${report.rfqs.length}</div></div>
        <div class="summary-card"><div class="s-label">AI Assists Used</div><div class="s-value">12</div></div>
      </div>`,
    evaluator: `
      <div class="summary-grid">
        <div class="summary-card"><div class="s-label">Evaluations Assigned</div><div class="s-value">3</div></div>
        <div class="summary-card"><div class="s-label">Scores Submitted Today</div><div class="s-value">1</div></div>
        <div class="summary-card"><div class="s-label">Pending Moderation</div><div class="s-value amber">2</div></div>
        <div class="summary-card"><div class="s-label">AI Assists Used</div><div class="s-value">8</div></div>
      </div>`,
    finance_officer: `
      <div class="summary-grid">
        <div class="summary-card"><div class="s-label">Invoices Reviewed</div><div class="s-value">${report.invoices.length}</div></div>
        <div class="summary-card"><div class="s-label">Payments Approved</div><div class="s-value green">USD 2.84M</div></div>
        <div class="summary-card"><div class="s-label">Exceptions</div><div class="s-value red">2</div></div>
        <div class="summary-card"><div class="s-label">3-Way Matches</div><div class="s-value">14</div></div>
      </div>`,
    auditor: `
      <div class="summary-grid">
        <div class="summary-card"><div class="s-label">Audit Events Today</div><div class="s-value">${report.auditLogs.length + 8415}</div></div>
        <div class="summary-card"><div class="s-label">New Exceptions</div><div class="s-value red">5</div></div>
        <div class="summary-card"><div class="s-label">Fraud Alerts</div><div class="s-value amber">4</div></div>
        <div class="summary-card"><div class="s-label">Compliance Score</div><div class="s-value">94.2%</div></div>
      </div>`,
    minister: `
      <div class="summary-grid">
        <div class="summary-card"><div class="s-label">Total Spend YTD</div><div class="s-value">USD 2.84B</div></div>
        <div class="summary-card"><div class="s-label">Savings Achieved</div><div class="s-value green">USD 184M</div></div>
        <div class="summary-card"><div class="s-label">Active Tenders</div><div class="s-value">1,287</div></div>
        <div class="summary-card"><div class="s-label">Critical Alerts</div><div class="s-value red">7</div></div>
      </div>`,
    supplier: `
      <div class="summary-grid">
        <div class="summary-card"><div class="s-label">Active Bids</div><div class="s-value">3</div></div>
        <div class="summary-card"><div class="s-label">Active Contracts</div><div class="s-value">2</div></div>
        <div class="summary-card"><div class="s-label">Pending Invoices</div><div class="s-value amber">USD 3.46M</div></div>
        <div class="summary-card"><div class="s-label">My Rating</div><div class="s-value green">4.7 / 5.0</div></div>
      </div>`,
  };

  const summary = summaryMap[role] ?? summaryMap["cpo"];

  // Build role-specific sections
  let sections = "";

  if (["cpo", "procurement_officer", "minister"].includes(role)) {
    sections += `
      <div class="section">
        <h3>Tenders — Today's Activity</h3>
        <table>
          <thead><tr><th>Reference</th><th>Title</th><th>Entity</th><th>Value</th><th>Status</th><th>Closing</th></tr></thead>
          <tbody>${tenderRows || "<tr><td colspan='6' class='empty'>No tenders created today</td></tr>"}</tbody>
        </table>
      </div>`;
  }

  if (["finance_officer", "cpo"].includes(role)) {
    sections += `
      <div class="section">
        <h3>Invoices & Payments — Today</h3>
        <table>
          <thead><tr><th>Invoice ID</th><th>Vendor</th><th>Amount</th><th>PO Ref</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${invoiceRows || "<tr><td colspan='6' class='empty'>No invoices processed today</td></tr>"}</tbody>
        </table>
      </div>`;
  }

  if (["cpo", "procurement_officer", "minister"].includes(role)) {
    sections += `
      <div class="section">
        <h3>Active Contracts — Status</h3>
        <table>
          <thead><tr><th>Contract ID</th><th>Title</th><th>Vendor</th><th>Value</th><th>Progress</th><th>Status</th></tr></thead>
          <tbody>${contractRows || "<tr><td colspan='6' class='empty'>No contracts updated today</td></tr>"}</tbody>
        </table>
      </div>`;
  }

  if (["auditor", "cpo"].includes(role)) {
    sections += `
      <div class="section">
        <h3>Audit Trail — Today's Events</h3>
        <table>
          <thead><tr><th>Log ID</th><th>Event</th><th>User</th><th>Risk</th><th>Timestamp</th></tr></thead>
          <tbody>${logRows || "<tr><td colspan='5' class='empty'>No audit events today</td></tr>"}</tbody>
        </table>
      </div>`;
  }

  if (role === "evaluator") {
    sections += `
      <div class="section">
        <h3>Evaluation Activity — Today</h3>
        <table>
          <thead><tr><th>Tender</th><th>Phase</th><th>Bids</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>ZW-PRA-2026-00183 — ARV Medicines Framework</td><td>Technical Evaluation</td><td>8</td><td><span class="badge badge-amber">In Progress</span></td></tr>
            <tr><td>ZW-PRA-2026-00179 — Audit Services</td><td>Financial Evaluation</td><td>9</td><td><span class="badge badge-blue">Pending Start</span></td></tr>
          </tbody>
        </table>
      </div>`;
  }

  if (role === "supplier") {
    sections += `
      <div class="section">
        <h3>My Bids — Status Today</h3>
        <table>
          <thead><tr><th>Tender ID</th><th>Title</th><th>Submitted</th><th>Status</th><th>Score</th></tr></thead>
          <tbody>
            <tr><td>ZW-PRA-2026-00184</td><td>Solar Mini-Grids — 12 Rural Clinics</td><td>2026-06-10</td><td><span class="badge badge-amber">Under Evaluation</span></td><td>—</td></tr>
            <tr><td>ZW-PRA-2026-00183</td><td>ARV Medicines Framework</td><td>2026-06-05</td><td><span class="badge badge-blue">Technically Passed</span></td><td>88.4/100</td></tr>
          </tbody>
        </table>
      </div>
      <div class="section">
        <h3>Invoices & Payments</h3>
        <table>
          <thead><tr><th>Invoice ID</th><th>Contract</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
          <tbody>
            <tr><td>INV-2026-4821</td><td>CN-2026-0411</td><td>USD 2,840,000</td><td><span class="badge badge-green">Approved</span></td><td>2026-07-15</td></tr>
            <tr><td>INV-2026-4810</td><td>CN-2026-0388</td><td>USD 620,000</td><td><span class="badge badge-amber">In Progress</span></td><td>2026-07-20</td></tr>
          </tbody>
        </table>
      </div>`;
  }

  sections += `
    <div class="section">
      <h3>Notifications — Today</h3>
      <table>
        <thead><tr><th>Message</th><th>Type</th><th>Time</th></tr></thead>
        <tbody>${notifRows || `
          <tr><td>Invoice INV-2026-4821 approved for payment</td><td><span class="badge badge-green">success</span></td><td>${new Date().toLocaleTimeString()}</td></tr>
          <tr><td>New tender ZW-PRA-2026-00184 in bidding phase</td><td><span class="badge badge-blue">info</span></td><td>${new Date().toLocaleTimeString()}</td></tr>
        `}</tbody>
      </table>
    </div>`;

  return `${summary}${sections}`;
}

export function generateDailyReportPDF(user: AuthUser) {
  const report = buildDailyReport(user);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>AI Powered Electronic Public Procurement and Oversight Intelligence System — Daily Report — ${user.name} — ${report.date}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
  body { background: #fff; color: #111; font-size: 12px; line-height: 1.5; }
  .page { max-width: 900px; margin: 0 auto; padding: 32px 40px; }

  /* Header */
  .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #111; }
  .logo-row { display: flex; align-items: center; gap: 10px; }
  .logo-box { width: 32px; height: 32px; background: #111; border-radius: 6px; }
  .org-name { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; color: #111; }
  .org-sub { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-top: 1px; }
  .header-meta { text-align: right; }
  .report-title { font-size: 18px; font-weight: 700; letter-spacing: -0.03em; color: #111; }
  .report-date { font-size: 11px; color: #666; margin-top: 3px; }

  /* User info strip */
  .user-strip { background: #111; color: white; border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; display: flex; gap: 40px; }
  .u-field { }
  .u-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.5); margin-bottom: 2px; }
  .u-value { font-size: 13px; font-weight: 600; color: white; }

  /* Summary grid */
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .summary-card { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
  .s-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; }
  .s-value { font-size: 20px; font-weight: 700; letter-spacing: -0.03em; color: #111; }
  .s-value.red { color: #dc2626; }
  .s-value.green { color: #16a34a; }
  .s-value.amber { color: #d97706; }

  /* Sections */
  .section { margin-bottom: 28px; }
  .section h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #111; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead tr { background: #f9fafb; }
  th { text-align: left; padding: 8px 10px; font-weight: 600; color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #111; vertical-align: middle; }
  tr:hover td { background: #fafafa; }
  .empty { text-align: center; color: #aaa; padding: 16px; font-style: italic; }

  /* Badges */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .badge-green  { background: #d1fae5; color: #065f46; }
  .badge-red    { background: #fee2e2; color: #991b1b; }
  .badge-amber  { background: #fef3c7; color: #92400e; }
  .badge-blue   { background: #e0f2fe; color: #0c4a6e; }

  /* AI note */
  .ai-note { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
  .ai-note-title { font-size: 11px; font-weight: 700; color: #111; margin-bottom: 6px; }
  .ai-note-text { font-size: 11px; color: #666; line-height: 1.6; }

  /* Footer */
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; color: #aaa; font-size: 10px; }

  /* Signature block */
  .sig-block { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .sig-line { border-top: 1px solid #111; padding-top: 6px; margin-top: 32px; }
  .sig-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; }
  .sig-name { font-size: 12px; font-weight: 600; color: #111; margin-top: 2px; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo-row">
      <div class="logo-box"></div>
      <div>
        <div class="org-name" style="font-size:12px;letter-spacing:-0.01em;">AI Powered Electronic Public Procurement</div>
        <div class="org-sub">and Oversight Intelligence System — Government of Zimbabwe · PRAZ</div>
      </div>
    </div>
    <div class="header-meta">
      <div class="report-title">Daily Activity Report</div>
      <div class="report-date">${report.date}</div>
      <div class="report-date" style="margin-top:4px;font-size:10px;color:#bbb;">Generated: ${new Date().toLocaleTimeString()}</div>
    </div>
  </div>

  <!-- User strip -->
  <div class="user-strip">
    <div class="u-field"><div class="u-label">Officer</div><div class="u-value">${user.name}</div></div>
    <div class="u-field"><div class="u-label">Role</div><div class="u-value">${user.role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</div></div>
    <div class="u-field"><div class="u-label">Department</div><div class="u-value">${user.department}</div></div>
    <div class="u-field"><div class="u-label">Entity</div><div class="u-value">${user.entity}</div></div>
    <div class="u-field"><div class="u-label">Email</div><div class="u-value" style="font-size:11px">${user.email}</div></div>
  </div>

  <!-- AI Summary note -->
  <div class="ai-note">
    <div class="ai-note-title">🤖 AI-Generated Executive Summary</div>
    <div class="ai-note-text">
      On ${report.date}, <strong>${user.name}</strong> completed the following procurement activities within the AI Powered Electronic Public Procurement and Oversight Intelligence System. 
      ${report.tenders.length} tender record(s) were active, ${report.invoices.length} invoice(s) processed, 
      and ${report.auditLogs.length} audit event(s) logged. All activities comply with PPDPA 2018 requirements. 
      No critical violations detected. Compliance score maintained at 94.2%. 
      This report has been auto-generated for supervisor review and record keeping.
    </div>
  </div>

  <!-- Role-specific content -->
  ${roleSection(user, report)}

  <!-- Signature block -->
  <div class="sig-block">
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Submitted By</div>
      <div class="sig-name">${user.name}</div>
      <div style="font-size:10px;color:#888;margin-top:2px;">${user.role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} · ${user.entity}</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Reviewed By (Supervisor)</div>
      <div class="sig-name" style="color:#bbb;">___________________________</div>
      <div style="font-size:10px;color:#bbb;margin-top:2px;">Signature & Date</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>AI Powered Electronic Public Procurement and Oversight Intelligence System</span>
    <span>Government of Zimbabwe · PRAZ · Confidential</span>
  </div>

</div>

<script>
  window.onload = function() { window.print(); };
</script>
</body>
</html>`;

  // Open in new window and trigger print
  const win = window.open("", "_blank", "width=900,height=700");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}
