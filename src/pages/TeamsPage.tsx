import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import {
  Users, Plus, Search, MessageSquare, FileText, CheckCircle2, Clock,
  AlertTriangle, Eye, Edit3, Download, Send, Bell, Calendar,
  Folder, Star, Activity, ChevronRight, Cpu, Zap, Target, Archive,
  Shield, RefreshCw, BookOpen, UserCheck, Link2,
  Filter, TrendingUp, BarChart3, Award, Coffee,
  Video, Mic, Phone, Globe, Hash, AtSign, Paperclip,
  ClipboardList, PieChart, Layers, GitBranch, AlarmClock,
  ThumbsUp, Smile, Heart, Lightbulb, Clipboard,
  Briefcase, Map, Gauge, ChevronDown, ChevronUp, MoreHorizontal,
  Timer, UserPlus, Building, Flag, Repeat, Settings,
  GraduationCap, Trophy, ListChecks, StickyNote, Kanban,
  LayoutGrid, BrainCircuit, HeartPulse, ScrollText, Rocket,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, PieChart as RePieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MY_TEAMS = [
  { id:"TM-001", name:"Solar Mini-Grids Tender Team", type:"Tender Team", members:6, documents:28, tasks:14, completed:9, status:"Active", lastActivity:"2 hrs ago", lead:"T. Moyo" },
  { id:"TM-002", name:"ARV Framework Evaluation Committee", type:"Evaluation Team", members:5, documents:42, tasks:8, completed:8, status:"Completed", lastActivity:"1 day ago", lead:"P. Dube" },
  { id:"TM-003", name:"Infrastructure Procurement Working Group", type:"Working Group", members:12, documents:84, tasks:22, completed:14, status:"Active", lastActivity:"30 min ago", lead:"A. Mpofu" },
  { id:"TM-004", name:"Q3 2026 Budget Review Team", type:"Review Team", members:4, documents:18, tasks:6, completed:3, status:"Active", lastActivity:"4 hrs ago", lead:"R. Chikwanda" },
  { id:"TM-005", name:"Vendor Compliance Task Force", type:"Task Force", members:8, documents:36, tasks:18, completed:11, status:"Active", lastActivity:"1 hr ago", lead:"S. Nkosi" },
];

const TEAM_TASKS = [
  { id:"TSK-001", title:"Finalise bid evaluation scoresheet — Solar Mini-Grids", assignee:"P. Dube", team:"TM-001", priority:"High", due:"2026-06-25", status:"In Progress" },
  { id:"TSK-002", title:"Review technical specifications document v3", assignee:"A. Mpofu", team:"TM-001", priority:"Medium", due:"2026-06-24", status:"Completed" },
  { id:"TSK-003", title:"Submit compliance checklist — ARV Framework", assignee:"S. Nkosi", team:"TM-002", priority:"High", due:"2026-06-22", status:"Overdue" },
  { id:"TSK-004", title:"Prepare award recommendation memo", assignee:"T. Moyo", team:"TM-001", priority:"Critical", due:"2026-06-26", status:"In Progress" },
  { id:"TSK-005", title:"Update vendor prequalification list", assignee:"R. Chikwanda", team:"TM-003", priority:"Medium", due:"2026-06-28", status:"Not Started" },
  { id:"TSK-006", title:"Document review — Infrastructure contract templates", assignee:"J. Banda", team:"TM-003", priority:"Low", due:"2026-06-30", status:"Not Started" },
  { id:"TSK-007", title:"Budget allocation review Q3", assignee:"R. Chikwanda", team:"TM-004", priority:"High", due:"2026-06-23", status:"In Progress" },
];

const TEAM_DOCS = [
  { id:"DOC-001", name:"Solar Mini-Grids — Bid Evaluation Matrix v4.xlsx", team:"TM-001", type:"Spreadsheet", size:"284 KB", version:"v4", uploadedBy:"P. Dube", date:"2026-06-21", status:"Final" },
  { id:"DOC-002", name:"ARV Framework — Evaluation Report Final.docx", team:"TM-002", type:"Document", size:"1.2 MB", version:"v8", uploadedBy:"T. Moyo", date:"2026-06-15", status:"Approved" },
  { id:"DOC-003", name:"Infrastructure Procurement SOP 2026.pdf", team:"TM-003", type:"Policy", size:"4.8 MB", version:"v2", uploadedBy:"A. Mpofu", date:"2026-06-10", status:"Published" },
  { id:"DOC-004", name:"Vendor Compliance Checklist Template.xlsx", team:"TM-005", type:"Template", size:"142 KB", version:"v3", uploadedBy:"S. Nkosi", date:"2026-06-18", status:"Active" },
  { id:"DOC-005", name:"Q3 Budget Review Dashboard.pptx", team:"TM-004", type:"Presentation", size:"2.4 MB", version:"v1", uploadedBy:"R. Chikwanda", date:"2026-06-20", status:"Draft" },
];

const ACTIVITY_FEED = [
  { action:"T. Moyo uploaded Solar Mini-Grids Evaluation Matrix v4", time:"2 hrs ago", type:"document" },
  { action:"P. Dube completed task: Technical specifications review", time:"3 hrs ago", type:"task" },
  { action:"A. Mpofu replied to: Clarification on evaluation weighting", time:"3 hrs ago", type:"discussion" },
  { action:"New member J. Banda added to Infrastructure Working Group", time:"4 hrs ago", type:"member" },
  { action:"R. Chikwanda shared Q3 Budget Dashboard v1", time:"5 hrs ago", type:"document" },
  { action:"Task overdue: ARV Framework compliance checklist — S. Nkosi", time:"6 hrs ago", type:"alert" },
  { action:"S. Nkosi posted new discussion: Vendor suspension criteria", time:"1 day ago", type:"discussion" },
];

const COLLAB_STATS = [
  { day:"Mon", tasks:8, docs:5, messages:24 },
  { day:"Tue", tasks:12, docs:8, messages:32 },
  { day:"Wed", tasks:6, docs:4, messages:18 },
  { day:"Thu", tasks:14, docs:10, messages:42 },
  { day:"Fri", tasks:10, docs:7, messages:28 },
];

const PRIORITY_TONE: Record<string,"red"|"amber"|"blue"|"muted"> = {
  Critical:"red", High:"amber", Medium:"blue", Low:"muted"
};
const STATUS_TONE: Record<string,"green"|"blue"|"amber"|"red"|"muted"|"violet"> = {
  Completed:"muted", "In Progress":"blue", "Not Started":"muted", Overdue:"red",
  Active:"green", Done:"green"
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-black">{title}</div>
      {subtitle && <div className="text-xs text-black/40 mt-0.5">{subtitle}</div>}
    </div>
  );
}

function FeatureGrid({ items }: { items: { icon: React.ElementType; title: string; desc: string; color?: string }[] }) {
  const bg: Record<string, string> = {
    blue:"bg-slate-50 text-[#0F172A]", green:"bg-slate-50 text-[#0F172A]",
    amber:"bg-slate-50 text-[#0F172A]", violet:"bg-slate-50 text-[#0F172A]",
    cyan:"bg-slate-50 text-[#0F172A]", red:"bg-red-50 text-red-600",
    orange:"bg-slate-50 text-[#0F172A]", pink:"bg-slate-50 text-[#0F172A]",
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {items.map(({ icon: Icon, title, desc, color = "blue" }) => (
        <div key={title} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm hover:border-black/15 transition-all">
          <div className={`h-8 w-8 rounded-lg grid place-items-center mb-2 ${bg[color] ?? bg.blue}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-xs font-semibold text-black mb-1">{title}</div>
          <div className="text-[11px] text-black/50 leading-relaxed">{desc}</div>
        </div>
      ))}
    </div>
  );
}

function SubTabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-none border-b border-black/8">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
            active === t ? "bg-black/90 text-white" : "text-black/50 hover:text-black hover:bg-[#EAF1F8]"
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MY ACTIVITY — Sub-sections
// ══════════════════════════════════════════════════════════════════════════════

// ─── MY ACTIVITY: Personal Dashboard ─────────────────────────────────────────
function ActivityDashboard({ onAction, userName }: { onAction: (m: string) => void; userName: string }) {
  const myTasks = TEAM_TASKS.filter(t => t.assignee.includes(userName.split(" ")[0]));
  const kpiData = [
    { subject: "Tasks", A: 78 }, { subject: "Meetings", A: 65 }, { subject: "Docs", A: 90 },
    { subject: "KPIs", A: 82 }, { subject: "Comms", A: 70 }, { subject: "Learning", A: 55 },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="My Open Tasks" value={String(myTasks.filter(t => t.status !== "Completed").length + 4)} delta="2 due today" icon={CheckCircle2} color="blue" />
        <KpiCard label="Productivity Score" value="84%" delta="+3 pts this week" icon={Gauge} color="green" />
        <KpiCard label="Unread Notifications" value="12" delta="4 mentions" positive={false} icon={Bell} color="amber" />
        <KpiCard label="Goals Progress" value="6/10" delta="60% complete" icon={Target} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Daily Priorities" subtitle="AI-ranked tasks for today" />
            <div className="divide-y divide-black/5">
              {[...myTasks, ...TEAM_TASKS.slice(0, 3)].slice(0, 5).map(t => (
                <div key={t.id} className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-[#EAF1F8]/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${t.status === "Overdue" ? "bg-red-500" : t.status === "In Progress" ? "bg-[#0F172A]" : t.status === "Completed" ? "bg-slate-400" : "bg-gray-300"}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate ${t.status === "Completed" ? "text-black/30 line-through" : "text-black"}`}>{t.title}</div>
                      <div className="text-[10px] text-black/40 mt-0.5">Due {t.due}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                    <Badge tone={STATUS_TONE[t.status] as "green"|"blue"|"amber"|"red"|"muted"|"violet"}>{t.status}</Badge>
                    {t.status !== "Completed" && (
                      <button onClick={() => onAction(`Task marked complete: ${t.id}`)} className="h-6 w-6 rounded-lg border border-black/10 grid place-items-center hover:bg-slate-50 hover:border-slate-200 transition-colors">
                        <CheckCircle2 className="h-3 w-3 text-black/30" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="This Week's Activity" subtitle="Tasks, documents and messages" />
            <div className="p-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COLLAB_STATS}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="tasks" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Tasks" />
                  <Bar dataKey="docs" fill="#10B981" radius={[3, 3, 0, 0]} name="Docs" />
                  <Bar dataKey="messages" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Messages" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Performance Radar" subtitle="Your skill balance" />
            <div className="p-2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={kpiData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar name="You" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming" subtitle="Calendar events & deadlines" />
            <div className="divide-y divide-black/5">
              {[
                { title: "Bid Evaluation — Solar", date: "Jun 25", time: "09:00", type: "Meeting" },
                { title: "Award Recommendation Memo Due", date: "Jun 26", time: "17:00", type: "Deadline" },
                { title: "Infrastructure WG Review", date: "Jun 27", time: "14:00", type: "Meeting" },
                { title: "Q3 Budget Submission", date: "Jun 30", time: "17:00", type: "Deadline" },
              ].map(ev => (
                <div key={ev.title} className="px-4 py-2.5 flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-lg grid place-items-center flex-shrink-0 ${ev.type === "Deadline" ? "bg-red-100" : "bg-slate-100"}`}>
                    {ev.type === "Deadline" ? <AlertTriangle className="h-3 w-3 text-red-600" /> : <Calendar className="h-3 w-3 text-[#0F172A]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black truncate">{ev.title}</div>
                    <div className="text-[10px] text-black/40">{ev.date} · {ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" subtitle="Your latest actions" />
            <div className="divide-y divide-black/5 max-h-[200px] overflow-y-auto">
              {ACTIVITY_FEED.slice(0, 5).map((a, i) => (
                <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                  <div className={`h-5 w-5 rounded-full grid place-items-center flex-shrink-0 mt-0.5 ${a.type === "alert" ? "bg-red-100" : a.type === "task" ? "bg-slate-100" : a.type === "document" ? "bg-slate-100" : a.type === "member" ? "bg-slate-100" : "bg-slate-100"}`}>
                    {a.type === "task" && <CheckCircle2 className="h-3 w-3 text-[#0F172A]" />}
                    {a.type === "document" && <FileText className="h-3 w-3 text-[#0F172A]" />}
                    {a.type === "discussion" && <MessageSquare className="h-3 w-3 text-[#0F172A]" />}
                    {a.type === "member" && <UserCheck className="h-3 w-3 text-[#0F172A]" />}
                    {a.type === "alert" && <AlertTriangle className="h-3 w-3 text-red-600" />}
                  </div>
                  <div>
                    <div className="text-xs text-black/70">{a.action}</div>
                    <div className="text-[10px] text-black/30 mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── MY ACTIVITY: Task Management ────────────────────────────────────────────
function ActivityTasks({ onAction }: { onAction: (m: string) => void }) {
  const [filter, setFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "Medium", due: "", category: "General", recurring: false });

  const filtered = TEAM_TASKS.filter(t => filter === "All" || t.status === filter);

  const CATEGORIES = ["General", "Procurement", "Evaluation", "Compliance", "Finance", "Reporting"];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total My Tasks" value="35" delta="8 due this week" icon={ListChecks} color="blue" />
        <KpiCard label="In Progress" value="9" delta="3 with deadlines" icon={Activity} color="green" />
        <KpiCard label="Overdue" value="3" delta="Urgent attention" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Completed (MTD)" value="24" delta="96% on time" icon={CheckCircle2} color="violet" />
      </div>

      <div className="flex flex-wrap gap-2 mb-1">
        {["All", "In Progress", "Not Started", "Overdue", "Completed"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`h-8 px-3 rounded-xl text-xs font-medium transition-colors ${filter === s ? "bg-black text-white" : "border border-black/10 bg-white text-black/60 hover:text-black hover:bg-[#EAF1F8]"}`}>
            {s}
          </button>
        ))}
        <button onClick={() => setShowNew(v => !v)}
          className="h-8 px-3 rounded-xl bg-black text-white text-xs font-medium flex items-center gap-1 hover:bg-gray-800 ml-auto">
          <Plus className="h-3 w-3" /> New Task
        </button>
      </div>

      {showNew && (
        <Card>
          <CardHeader title="Create New Task" />
          <div className="p-4 space-y-3">
            <input value={newTask.title} onChange={e => setNewTask(v => ({ ...v, title: e.target.value }))}
              placeholder="Task title…"
              className="w-full h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm focus:outline-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select value={newTask.priority} onChange={e => setNewTask(v => ({ ...v, priority: e.target.value }))}
                className="h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-xs">
                {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
              </select>
              <select value={newTask.category} onChange={e => setNewTask(v => ({ ...v, category: e.target.value }))}
                className="h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-xs">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="date" value={newTask.due} onChange={e => setNewTask(v => ({ ...v, due: e.target.value }))}
                className="h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-xs" />
              <label className="flex items-center gap-2 text-xs text-black/60 h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] cursor-pointer">
                <input type="checkbox" checked={newTask.recurring} onChange={e => setNewTask(v => ({ ...v, recurring: e.target.checked }))} />
                Recurring
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { onAction(`Task created: ${newTask.title || "Untitled"}`); setShowNew(false); setNewTask({ title: "", priority: "Medium", due: "", category: "General", recurring: false }); }}
                className="h-8 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800">Create Task</button>
              <button onClick={() => setShowNew(false)} className="h-8 px-4 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8]">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title={`Tasks — ${filtered.length} items`} action={
          <button onClick={() => onAction("Tasks exported")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Task", "Priority", "Category", "Due Date", "Status", "Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black max-w-[240px] truncate">{t.title}</td>
                  <td className="px-4 py-3"><Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge></td>
                  <td className="px-4 py-3 text-xs text-black/40">Procurement</td>
                  <td className="px-4 py-3 text-xs text-black/60">{t.due}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[t.status] as "green"|"blue"|"amber"|"red"|"muted"|"violet"}>{t.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {t.status !== "Completed" && <button onClick={() => onAction(`Completed: ${t.id}`)} className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Done</button>}
                      <button onClick={() => onAction(`Editing: ${t.id}`)} className="h-7 px-2 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]"><Edit3 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <SectionHeader title="Additional Task Tools" subtitle="More ways to manage your personal workload" />
        <FeatureGrid items={[
          { icon: Repeat, title: "Recurring Tasks", desc: "Set up tasks that auto-repeat on a schedule", color: "blue" },
          { icon: AlarmClock, title: "Task Reminders", desc: "Get notified before deadlines and blockers", color: "amber" },
          { icon: Kanban, title: "Kanban Board", desc: "Drag-and-drop visual task management", color: "violet" },
          { icon: Timer, title: "Time Estimates", desc: "Set time estimates and track actuals", color: "green" },
          { icon: Flag, title: "Priority Flags", desc: "Flag critical items for immediate attention", color: "red" },
          { icon: StickyNote, title: "Personal Action Items", desc: "Quick action items from meetings and reviews", color: "orange" },
          { icon: ListChecks, title: "To-Do Lists", desc: "Lightweight checklist for day-to-day items", color: "cyan" },
          { icon: Layers, title: "Task Categories", desc: "Organise tasks by project, type, or team", color: "pink" },
        ]} />
      </div>
    </div>
  );
}

// ─── MY ACTIVITY: Time & Attendance ──────────────────────────────────────────
function ActivityTimeAttendance({ onAction }: { onAction: (m: string) => void }) {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime] = useState("08:32");
  const timelineData = [
    { day: "Mon", hours: 8.5 }, { day: "Tue", hours: 9.0 }, { day: "Wed", hours: 7.5 },
    { day: "Thu", hours: 8.0 }, { day: "Fri", hours: 6.0 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Today's Hours" value="6h 24m" delta="Clocked in 08:32" icon={Timer} color="blue" />
        <KpiCard label="This Week" value="39h" delta="1h overtime" icon={Clock} color="green" />
        <KpiCard label="Leave Balance" value="18 days" delta="Annual leave" icon={Calendar} color="amber" />
        <KpiCard label="Attendance Rate" value="97%" delta="This month" icon={CheckCircle2} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Clock In / Out" subtitle="Today — Monday, Jun 23 2026" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-black tracking-tight">14:56</div>
                <div className="text-xs text-black/40 mt-0.5">{clockedIn ? `Clocked in at ${clockInTime}` : "Not clocked in yet"}</div>
              </div>
              <button
                onClick={() => { setClockedIn(v => !v); onAction(clockedIn ? "Clocked out" : "Clocked in"); }}
                className={`h-14 w-14 rounded-full font-semibold text-sm flex items-center justify-center transition-colors ${clockedIn ? "bg-red-600 text-white hover:bg-red-700" : "bg-[#0F172A] text-white hover:bg-[#0F172A]"}`}>
                {clockedIn ? "Out" : "In"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Clock In", time: clockedIn ? clockInTime : "—", color: "emerald" },
                { label: "Clock Out", time: clockedIn ? "—" : "17:00 (est)", color: "red" },
                { label: "Break Start", time: "12:00", color: "amber" },
                { label: "Break End", time: "13:00", color: "amber" },
              ].map(r => (
                <div key={r.label} className="bg-[#EAF1F8] rounded-xl p-3">
                  <div className="text-[10px] text-black/40 mb-0.5">{r.label}</div>
                  <div className="text-sm font-semibold text-black">{r.time}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAction("Break started")} className="flex-1 h-8 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center justify-center gap-1"><Coffee className="h-3 w-3" /> Break</button>
              <button onClick={() => onAction("Overtime requested")} className="flex-1 h-8 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center justify-center gap-1"><Clock className="h-3 w-3" /> Overtime</button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Weekly Hours" subtitle="This week's time log" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="hours" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Leave & Requests" action={
          <button onClick={() => onAction("Leave request submitted")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> Request Leave</button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Type", "From", "To", "Days", "Status", "Reason"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {[
                { type: "Annual Leave", from: "2026-07-14", to: "2026-07-18", days: 5, status: "Approved", reason: "Family holiday" },
                { type: "Sick Leave", from: "2026-06-02", to: "2026-06-02", days: 1, status: "Approved", reason: "Medical" },
                { type: "Study Leave", from: "2026-08-03", to: "2026-08-07", days: 5, status: "Pending", reason: "Professional exam" },
              ].map(l => (
                <tr key={l.from} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{l.type}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{l.from}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{l.to}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{l.days}</td>
                  <td className="px-4 py-3"><Badge tone={l.status === "Approved" ? "green" : "amber"}>{l.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-black/40">{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <SectionHeader title="Attendance Tools" />
        <FeatureGrid items={[
          { icon: ScrollText, title: "Timesheets", desc: "Weekly timesheets with approval workflow", color: "blue" },
          { icon: Activity, title: "Activity Logs", desc: "Detailed daily work activity records", color: "green" },
          { icon: Timer, title: "Work Timers", desc: "Start/stop timers for tasks and projects", color: "amber" },
          { icon: Gauge, title: "Idle Detection", desc: "Auto-pause timer during periods of inactivity", color: "violet" },
          { icon: Calendar, title: "Shift Schedules", desc: "View your upcoming shifts and rotations", color: "cyan" },
          { icon: CheckCircle2, title: "Attendance History", desc: "Full history with export to PDF or CSV", color: "orange" },
        ]} />
      </div>
    </div>
  );
}

// ─── MY ACTIVITY: Communication ──────────────────────────────────────────────
function ActivityCommunication({ onAction }: { onAction: (m: string) => void }) {
  const [message, setMessage] = useState("");
  const CHANNELS = [
    { name: "# procurement-general", unread: 4, type: "channel" },
    { name: "# solar-minigrid-team", unread: 12, type: "channel" },
    { name: "# evaluations-q2", unread: 0, type: "channel" },
    { name: "@ P. Dube", unread: 2, type: "dm" },
    { name: "@ A. Mpofu", unread: 0, type: "dm" },
  ];
  const MSGS = [
    { sender: "T. Moyo", text: "Please review the updated evaluation matrix before Thursday", time: "10:32", avatar: "TM" },
    { sender: "P. Dube", text: "Done — I've left comments on sections 3 and 4", time: "10:45", avatar: "PD" },
    { sender: "A. Mpofu", text: "What is the weighting methodology for technical score?", time: "11:02", avatar: "AM" },
    { sender: "You", text: "The technical/financial split is 70/30 as per the procurement regulations", time: "11:15", avatar: "YO" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Unread Messages" value="18" delta="4 mentions" positive={false} icon={MessageSquare} color="blue" />
        <KpiCard label="Active Channels" value="8" delta="Across all teams" icon={Hash} color="green" />
        <KpiCard label="Announcements" value="3" delta="2 new this week" icon={Bell} color="amber" />
        <KpiCard label="Video Calls" value="2" delta="Scheduled today" icon={Video} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Channels */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader title="Channels & DMs" action={
              <button onClick={() => onAction("New channel created")} className="h-6 w-6 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Plus className="h-3 w-3" /></button>
            } />
            <div className="divide-y divide-black/5">
              {CHANNELS.map(c => (
                <button key={c.name} onClick={() => onAction(`Opened: ${c.name}`)} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#EAF1F8]/50 transition-colors text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {c.type === "channel" ? <Hash className="h-3.5 w-3.5 text-black/30 flex-shrink-0" /> : <AtSign className="h-3.5 w-3.5 text-black/30 flex-shrink-0" />}
                    <span className="text-xs text-black truncate">{c.name}</span>
                  </div>
                  {c.unread > 0 && <span className="h-5 min-w-5 px-1 rounded-full bg-black text-white text-[10px] font-bold grid place-items-center flex-shrink-0">{c.unread}</span>}
                </button>
              ))}
              <button onClick={() => onAction("Video call started")} className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left">
                <Video className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium">Start Video Call</span>
              </button>
              <button onClick={() => onAction("Voice note sent")} className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left">
                <Mic className="h-3.5 w-3.5 text-[#0F172A] flex-shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium">Record Voice Note</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col min-h-[420px]">
            <CardHeader title="# solar-minigrid-team" subtitle="6 members online" />
            <div className="flex-1 overflow-y-auto divide-y divide-black/5 p-1">
              {MSGS.map((m, i) => (
                <div key={i} className={`flex gap-3 px-4 py-3 ${m.sender === "You" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-7 w-7 rounded-full grid place-items-center flex-shrink-0 text-[10px] font-bold ${m.sender === "You" ? "bg-black text-white" : "bg-slate-100 text-[#0F172A]"}`}>
                    {m.avatar}
                  </div>
                  <div className={`max-w-[75%] ${m.sender === "You" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`text-[10px] text-black/40 mb-1 ${m.sender === "You" ? "text-right" : ""}`}>{m.sender} · {m.time}</div>
                    <div className={`text-xs px-3 py-2 rounded-xl leading-relaxed ${m.sender === "You" ? "bg-black text-white" : "bg-[#EAF1F8] text-black"}`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-black/8">
              <div className="flex gap-2">
                <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message…"
                  onKeyDown={e => { if (e.key === "Enter" && message.trim()) { onAction(`Message sent: "${message}"`); setMessage(""); } }}
                  className="flex-1 h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-xs focus:outline-none" />
                <button onClick={() => onAction("File attached")} className="h-9 w-9 rounded-xl border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Paperclip className="h-3.5 w-3.5 text-black/40" /></button>
                <button onClick={() => { if (message.trim()) { onAction(`Message sent: "${message}"`); setMessage(""); } }} className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center hover:bg-gray-800"><Send className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <SectionHeader title="Company News & Announcements" />
        <div className="space-y-3">
          {[
            { title: "New Procurement Regulations 2026 — Effective July 1", source: "PPDPA", time: "2 days ago", type: "Policy" },
            { title: "System maintenance scheduled — June 28, 22:00–02:00", source: "IT Dept", time: "3 days ago", type: "System" },
            { title: "Q2 Procurement Performance Results Now Available", source: "CPO Office", time: "1 week ago", type: "Report" },
          ].map(n => (
            <div key={n.title} className="bg-white border border-black/8 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm cursor-pointer" onClick={() => onAction(`Reading: ${n.title}`)}>
              <Bell className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-black">{n.title}</div>
                <div className="text-[10px] text-black/40 mt-0.5">{n.source} · {n.time}</div>
              </div>
              <Badge tone="amber">{n.type}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MY ACTIVITY: Work Execution ─────────────────────────────────────────────
function ActivityWorkExecution({ onAction }: { onAction: (m: string) => void }) {
  const WORKFLOWS = [
    { id: "WF-001", name: "Bid Evaluation — Solar Mini-Grids", stage: "Technical Evaluation", progress: 60, due: "Jun 25", status: "In Progress" },
    { id: "WF-002", name: "Contract Variation Request — Infrastructure", stage: "Legal Review", progress: 40, due: "Jun 28", status: "In Progress" },
    { id: "WF-003", name: "Vendor KYC Review — Batch Q2", stage: "Compliance Check", progress: 85, due: "Jun 24", status: "Near Complete" },
  ];
  const CHECKLISTS = [
    { name: "Pre-Bid Opening Checklist", items: 12, completed: 10, status: "Active" },
    { name: "Contract Award Checklist", items: 8, completed: 3, status: "Pending" },
    { name: "Vendor Verification Checklist", items: 15, completed: 15, status: "Completed" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Workflows" value="5" delta="2 near completion" icon={GitBranch} color="blue" />
        <KpiCard label="Pending Approvals" value="3" delta="Awaiting your sign-off" icon={CheckCircle2} color="amber" />
        <KpiCard label="Checklists Active" value="4" delta="1 overdue item" icon={ClipboardList} color="green" />
        <KpiCard label="SOPs Accessed" value="8" delta="This month" icon={BookOpen} color="violet" />
      </div>

      <Card>
        <CardHeader title="My Assigned Workflows" subtitle="Active workflows requiring your action" />
        <div className="divide-y divide-black/5">
          {WORKFLOWS.map(wf => (
            <div key={wf.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <div className="text-xs font-semibold text-black">{wf.name}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">{wf.id} · Current stage: {wf.stage} · Due {wf.due}</div>
                </div>
                <Badge tone={wf.status === "In Progress" ? "blue" : wf.status === "Near Complete" ? "green" : "amber"}>{wf.status}</Badge>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-[10px] text-black/40 mb-1"><span>Progress</span><span>{wf.progress}%</span></div>
                <div className="h-1.5 bg-[#EAF1F8] rounded-full overflow-hidden">
                  <div style={{ width: `${wf.progress}%` }} className="h-full rounded-full bg-[#0F172A]" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onAction(`Opened workflow: ${wf.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> View</button>
                <button onClick={() => onAction(`Action taken on: ${wf.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Act</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="My Checklists" action={
            <button onClick={() => onAction("New checklist created")} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Plus className="h-3 w-3" /> New</button>
          } />
          <div className="divide-y divide-black/5">
            {CHECKLISTS.map(cl => {
              const pct = Math.round(cl.completed / cl.items * 100);
              return (
                <div key={cl.name} className="px-5 py-3 hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Opened checklist: ${cl.name}`)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs font-semibold text-black">{cl.name}</div>
                    <Badge tone={cl.status === "Completed" ? "green" : cl.status === "Active" ? "blue" : "amber"}>{cl.status}</Badge>
                  </div>
                  <div className="flex justify-between text-[10px] text-black/40 mb-1"><span>{cl.completed}/{cl.items} items</span><span>{pct}%</span></div>
                  <div className="h-1 bg-[#EAF1F8] rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${pct === 100 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Pending Approvals" subtitle="Actions awaiting your approval" />
          <div className="divide-y divide-black/5">
            {[
              { id: "APR-001", title: "Contract variation — Road Construction Phase 2", requester: "J. Banda", type: "Contract", urgent: true },
              { id: "APR-002", title: "Vendor payment — ARV Supplies Ltd", requester: "Finance Dept", type: "Payment", urgent: false },
              { id: "APR-003", title: "RFQ dispatch — Office supplies Q3", requester: "A. Mpofu", type: "Procurement", urgent: false },
            ].map(a => (
              <div key={a.id} className="px-5 py-3 hover:bg-[#EAF1F8]/50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-xs font-semibold text-black">{a.title}</div>
                  {a.urgent && <Badge tone="red">Urgent</Badge>}
                </div>
                <div className="text-[10px] text-black/40 mb-2">{a.id} · {a.type} · Requested by {a.requester}</div>
                <div className="flex gap-2">
                  <button onClick={() => onAction(`Approved: ${a.id}`)} className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approve</button>
                  <button onClick={() => onAction(`Rejected: ${a.id}`)} className="h-7 px-2.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Reject</button>
                  <button onClick={() => onAction(`Viewing: ${a.id}`)} className="h-7 px-2 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]"><Eye className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader title="Work Tools & Resources" />
        <FeatureGrid items={[
          { icon: BookOpen, title: "SOP Access", desc: "Standard operating procedures for all procurement processes", color: "blue" },
          { icon: Globe, title: "Knowledge Base", desc: "Policies, guides, templates, and precedents", color: "green" },
          { icon: FileText, title: "Digital Forms", desc: "Submit procurement forms digitally with e-signatures", color: "violet" },
          { icon: ClipboardList, title: "Personal Inspections", desc: "Log field inspections and quality checks", color: "amber" },
          { icon: Shield, title: "Compliance Checker", desc: "Verify your work against regulatory requirements", color: "red" },
          { icon: Zap, title: "Quick Actions", desc: "One-click shortcuts to your most used workflows", color: "orange" },
        ]} />
      </div>
    </div>
  );
}

// ─── MY ACTIVITY: Reporting & Analytics ──────────────────────────────────────
function ActivityReporting({ onAction }: { onAction: (m: string) => void }) {
  const pieData = [
    { name: "Completed", value: 24, color: "#10B981" },
    { name: "In Progress", value: 9, color: "#3B82F6" },
    { name: "Overdue", value: 3, color: "#DC2626" },
    { name: "Not Started", value: 4, color: "#d1d5db" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Reports Generated" value="14" delta="This month" icon={BarChart3} color="blue" />
        <KpiCard label="KPI Score" value="84%" delta="+3 pts vs last month" icon={TrendingUp} color="green" />
        <KpiCard label="Goals Achieved" value="6/10" delta="On track for Q3" icon={Target} color="violet" />
        <KpiCard label="Pending Reports" value="2" delta="Due this week" positive={false} icon={AlertTriangle} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="My Performance Trend" subtitle="Monthly KPI score over 6 months" />
            <div className="p-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: "Jan", score: 74 }, { month: "Feb", score: 78 }, { month: "Mar", score: 72 },
                  { month: "Apr", score: 80 }, { month: "May", score: 81 }, { month: "Jun", score: 84 },
                ]}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6", r: 4 }} name="KPI Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title="My Reports" action={
              <button onClick={() => onAction("New report created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> New Report</button>
            } />
            <div className="divide-y divide-black/5">
              {[
                { name: "Personal Performance Report — June 2026", date: "2026-06-20", status: "Published", type: "Performance" },
                { name: "Task Completion Summary — Q2 2026", date: "2026-06-18", status: "Draft", type: "Summary" },
                { name: "Attendance & Leave Report — May 2026", date: "2026-05-31", status: "Published", type: "Attendance" },
              ].map(r => (
                <div key={r.name} className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-[#EAF1F8]/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <BarChart3 className="h-4 w-4 text-slate-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-black truncate">{r.name}</div>
                      <div className="text-[10px] text-black/40 mt-0.5">{r.date} · {r.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={r.status === "Published" ? "green" : "amber"}>{r.status}</Badge>
                    <button onClick={() => onAction(`Downloaded: ${r.name}`)} className="h-7 w-7 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Download className="h-3 w-3 text-black/40" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Task Breakdown" subtitle="Current status distribution" />
            <div className="p-3 h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="px-4 pb-4 space-y-1.5">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /><span className="text-black/60">{d.name}</span></div>
                  <span className="font-semibold text-black">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Quick Exports" />
            <div className="p-4 space-y-2">
              {["My Tasks (PDF)", "Attendance Log (CSV)", "Performance Summary (PDF)", "Weekly Report (Excel)"].map(e => (
                <button key={e} onClick={() => onAction(`Exported: ${e}`)}
                  className="w-full h-8 px-3 rounded-xl border border-black/10 text-xs text-black/70 hover:bg-[#EAF1F8] flex items-center gap-2 hover:border-black/20 transition-colors">
                  <Download className="h-3 w-3" /> {e}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div>
        <SectionHeader title="Reporting Tools" />
        <FeatureGrid items={[
          { icon: PieChart, title: "Personal Dashboards", desc: "Customise KPI widgets and chart views", color: "blue" },
          { icon: BarChart3, title: "Progress Reports", desc: "Auto-generated progress summaries", color: "green" },
          { icon: TrendingUp, title: "Performance Analytics", desc: "Trend analysis for your work metrics", color: "violet" },
          { icon: Target, title: "Goal Tracking", desc: "Set, monitor, and review personal goals", color: "amber" },
          { icon: ScrollText, title: "Audit Trail", desc: "Full record of all your actions and approvals", color: "red" },
          { icon: Award, title: "Achievements", desc: "Badges and recognitions for milestones", color: "orange" },
        ]} />
      </div>
    </div>
  );
}

// ─── MY ACTIVITY: AI Assistant ────────────────────────────────────────────────
function ActivityAI({ onAction }: { onAction: (m: string) => void }) {
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: "Hello! I'm your personal AI assistant. I can help you draft documents, analyse data, summarise reports, and answer procurement questions. What can I help you with today?" },
  ]);
  const AI_PROMPTS = [
    "Summarise my open tasks by priority",
    "Draft a memo requesting bid extension",
    "Analyse vendor evaluation scores",
    "What are the PPDPA 2026 changes?",
    "Generate a checklist for contract award",
    "Explain the two-envelope system",
  ];
  function sendAI(text: string) {
    const msg = text || aiInput.trim();
    if (!msg) return;
    setAiMessages(prev => [...prev,
      { role: "user", text: msg },
      { role: "ai", text: `Processing your request: "${msg}". I've analysed the relevant procurement data and generated a response based on PPDPA regulations and your current workflow context.` }
    ]);
    setAiInput("");
    onAction(`AI prompt: ${msg}`);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="AI Sessions" value="24" delta="This month" icon={BrainCircuit} color="blue" />
        <KpiCard label="Docs Drafted" value="8" delta="With AI assistance" icon={FileText} color="green" />
        <KpiCard label="Queries Resolved" value="31" delta="Average 18s response" icon={Zap} color="violet" />
        <KpiCard label="AI Suggestions" value="12" delta="Pending review" icon={Lightbulb} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="flex flex-col min-h-[480px]">
            <CardHeader title="AI Personal Assistant" subtitle="Powered by procurement intelligence" />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-7 w-7 rounded-full grid place-items-center flex-shrink-0 text-[10px] font-bold ${m.role === "user" ? "bg-black text-white" : "bg-slate-100 text-[#0F172A]"}`}>
                    {m.role === "user" ? "ME" : "AI"}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === "user" ? "bg-black text-white" : "bg-[#EAF1F8] text-black"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-black/8">
              <div className="flex gap-2">
                <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendAI(""); }}
                  placeholder="Ask the AI assistant…"
                  className="flex-1 h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-xs focus:outline-none" />
                <button onClick={() => sendAI("")} className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center hover:bg-gray-800">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Suggested Prompts" subtitle="Quick-start AI requests" />
            <div className="p-3 space-y-1.5">
              {AI_PROMPTS.map(p => (
                <button key={p} onClick={() => sendAI(p)}
                  className="w-full h-auto min-h-8 px-3 py-2 rounded-xl border border-black/10 text-xs text-black/70 hover:bg-slate-50 hover:border-slate-200 hover:text-[#0F172A] text-left transition-colors leading-relaxed">
                  {p}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="AI Capabilities" />
            <div className="p-3 space-y-2">
              {[
                { icon: FileText, label: "Document Drafting", color: "text-[#0F172A] bg-slate-50" },
                { icon: BarChart3, label: "Data Analysis", color: "text-[#0F172A] bg-slate-50" },
                { icon: BookOpen, label: "Policy Q&A", color: "text-[#0F172A] bg-slate-50" },
                { icon: CheckCircle2, label: "Checklist Generation", color: "text-[#0F172A] bg-slate-50" },
                { icon: RefreshCw, label: "Workflow Automation", color: "text-[#0F172A] bg-slate-50" },
                { icon: Lightbulb, label: "Smart Suggestions", color: "text-[#0F172A] bg-slate-50" },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#EAF1F8] cursor-pointer" onClick={() => onAction(`AI feature: ${c.label}`)}>
                  <div className={`h-6 w-6 rounded-lg grid place-items-center ${c.color}`}>
                    <c.icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-black/70">{c.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── MY ACTIVITY: File Management ────────────────────────────────────────────
function ActivityFiles({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="My Documents" value="48" delta="12 shared with teams" icon={FileText} color="blue" />
        <KpiCard label="Storage Used" value="1.4 GB" delta="of 5 GB quota" icon={Archive} color="green" />
        <KpiCard label="Shared With Me" value="23" delta="3 new this week" icon={UserCheck} color="violet" />
        <KpiCard label="Pending Reviews" value="5" delta="Awaiting your feedback" positive={false} icon={Clock} color="amber" />
      </div>

      <Card>
        <CardHeader title="My Files" action={
          <div className="flex gap-2">
            <button onClick={() => onAction("File uploaded")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> Upload</button>
            <button onClick={() => onAction("New folder created")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Folder className="h-3 w-3" /> New Folder</button>
          </div>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Name", "Type", "Size", "Modified", "Status", "Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {TEAM_DOCS.map(d => (
                <tr key={d.id} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      <div className="text-xs font-semibold text-black truncate max-w-[220px]">{d.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/50">{d.type}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{d.size}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{d.date}</td>
                  <td className="px-4 py-3"><Badge tone={d.status === "Final" || d.status === "Approved" || d.status === "Published" ? "green" : d.status === "Active" ? "blue" : "amber"}>{d.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => onAction(`Viewed: ${d.name}`)} className="h-7 w-7 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Eye className="h-3 w-3 text-black/40" /></button>
                      <button onClick={() => onAction(`Downloaded: ${d.name}`)} className="h-7 w-7 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Download className="h-3 w-3 text-black/40" /></button>
                      <button onClick={() => onAction(`Shared: ${d.name}`)} className="h-7 w-7 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Link2 className="h-3 w-3 text-black/40" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <SectionHeader title="File Management Tools" />
        <FeatureGrid items={[
          { icon: Folder, title: "Personal Folders", desc: "Organise documents in nested folder structures", color: "amber" },
          { icon: Star, title: "Starred Files", desc: "Bookmark frequently accessed documents", color: "orange" },
          { icon: Link2, title: "File Sharing", desc: "Share files with team members or externally", color: "blue" },
          { icon: RefreshCw, title: "Version Control", desc: "Track document versions and revision history", color: "violet" },
          { icon: Shield, title: "Access Permissions", desc: "Set read, write, or view-only permissions", color: "red" },
          { icon: Archive, title: "Document Archive", desc: "Archive completed project documents", color: "green" },
          { icon: Eye, title: "Document Preview", desc: "Preview PDFs, spreadsheets, and presentations", color: "cyan" },
          { icon: BrainCircuit, title: "AI Document Search", desc: "Full-text semantic search across your files", color: "pink" },
        ]} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MY TEAM TAB — full team coordination hub
// ══════════════════════════════════════════════════════════════════════════════
function MyTeamTab({ onAction }: { onAction: (m: string) => void }) {
  const [subTab, setSubTab] = useState("Overview");
  const SUB_TABS = ["Overview", "Members", "Tasks", "Documents", "Discussions", "Planning", "Analytics", "Settings"];

  return (
    <div className="space-y-5">
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />

      {subTab === "Overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="My Teams" value={String(MY_TEAMS.length)} delta="3 active, 1 completed" icon={Users} color="blue" />
            <KpiCard label="Open Tasks" value="32" delta="Across all teams" icon={ListChecks} color="amber" />
            <KpiCard label="Team Documents" value="208" delta="Updated this week: 14" icon={FileText} color="green" />
            <KpiCard label="Pending Actions" value="7" delta="Require your input" positive={false} icon={Bell} color="red" />
          </div>

          <div className="space-y-3">
            {MY_TEAMS.map(team => {
              const pct = Math.round(team.completed / team.tasks * 100);
              return (
                <div key={team.id} className="bg-white border border-black/8 rounded-xl p-5 hover:shadow-sm hover:border-black/15 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-black">{team.name}</div>
                      <div className="text-xs text-black/40 mt-0.5">{team.id} · {team.type} · Lead: {team.lead} · Last activity: {team.lastActivity}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge tone={team.status === "Active" ? "green" : "muted"}>{team.status}</Badge>
                      <button onClick={() => onAction(`Opened team: ${team.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Eye className="h-3 w-3" /> View</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-[#EAF1F8] rounded-lg p-2.5 text-center">
                      <div className="text-base font-bold text-black">{team.members}</div>
                      <div className="text-[10px] text-black/40">Members</div>
                    </div>
                    <div className="bg-[#EAF1F8] rounded-lg p-2.5 text-center">
                      <div className="text-base font-bold text-black">{team.tasks}</div>
                      <div className="text-[10px] text-black/40">Tasks</div>
                    </div>
                    <div className="bg-[#EAF1F8] rounded-lg p-2.5 text-center">
                      <div className="text-base font-bold text-black">{team.documents}</div>
                      <div className="text-[10px] text-black/40">Documents</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-black/40 mb-1"><span>Task completion</span><span>{team.completed}/{team.tasks} — {pct}%</span></div>
                    <div className="h-1.5 bg-[#EAF1F8] rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${pct === 100 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <SectionHeader title="Team Coordination Features" subtitle="Collaborate, plan, and deliver as a team" />
            <FeatureGrid items={[
              { icon: UserPlus, title: "Team Formation", desc: "Create and configure new procurement teams", color: "blue" },
              { icon: Briefcase, title: "Project Workspaces", desc: "Dedicated shared spaces per tender or project", color: "green" },
              { icon: GitBranch, title: "Team Workflows", desc: "Assign and manage team-level workflows", color: "violet" },
              { icon: Video, title: "Team Meetings", desc: "Schedule and run video or in-person meetings", color: "amber" },
              { icon: BarChart3, title: "Team Analytics", desc: "Track team performance and delivery metrics", color: "cyan" },
              { icon: GraduationCap, title: "Knowledge Sharing", desc: "Share lessons learned and best practices", color: "orange" },
              { icon: Shield, title: "Team Compliance", desc: "Ensure all members meet compliance standards", color: "red" },
              { icon: Trophy, title: "Team Achievements", desc: "Recognise and celebrate team milestones", color: "pink" },
            ]} />
          </div>
        </div>
      )}

      {subTab === "Members" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Members" value="35" delta="Across all teams" icon={Users} color="blue" />
            <KpiCard label="Online Now" value="14" delta="40% of team" icon={HeartPulse} color="green" />
            <KpiCard label="Roles Assigned" value="35" delta="All covered" icon={UserCheck} color="violet" />
            <KpiCard label="Pending Invites" value="2" delta="Awaiting acceptance" icon={UserPlus} color="amber" />
          </div>
          <Card>
            <CardHeader title="Team Members Directory" action={
              <button onClick={() => onAction("Invite sent")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><UserPlus className="h-3 w-3" /> Invite Member</button>
            } />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAF1F8] text-xs text-black/40">
                  <tr>{["Member", "Role", "Teams", "Tasks", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {[
                    { name: "T. Moyo", role: "Team Lead", teams: 2, tasks: 8, status: "Online" },
                    { name: "P. Dube", role: "Evaluator", teams: 3, tasks: 6, status: "Online" },
                    { name: "A. Mpofu", role: "Working Group Lead", teams: 1, tasks: 12, status: "Busy" },
                    { name: "R. Chikwanda", role: "Finance Rep", teams: 2, tasks: 5, status: "Away" },
                    { name: "S. Nkosi", role: "Compliance Officer", teams: 2, tasks: 9, status: "Online" },
                    { name: "J. Banda", role: "Procurement Officer", teams: 1, tasks: 4, status: "Offline" },
                  ].map(m => (
                    <tr key={m.name} className="hover:bg-[#EAF1F8]/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-100 text-[#0F172A] text-[10px] font-bold grid place-items-center flex-shrink-0">
                            {m.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="text-xs font-semibold text-black">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-black/60">{m.role}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{m.teams}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{m.tasks}</td>
                      <td className="px-4 py-3">
                        <Badge tone={m.status === "Online" ? "green" : m.status === "Busy" ? "red" : m.status === "Away" ? "amber" : "muted"}>{m.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => onAction(`Message to ${m.name}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Message</button>
                          <button onClick={() => onAction(`Profile: ${m.name}`)} className="h-7 w-7 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Eye className="h-3 w-3 text-black/40" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {subTab === "Tasks" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Team Tasks" value="71" delta="Across all teams" icon={ListChecks} color="blue" />
            <KpiCard label="In Progress" value="24" delta="On track" icon={Activity} color="green" />
            <KpiCard label="Overdue" value="6" delta="Needs attention" positive={false} icon={AlertTriangle} color="red" />
            <KpiCard label="Completed (MTD)" value="38" delta="94% on time" icon={CheckCircle2} color="violet" />
          </div>
          <Card>
            <CardHeader title="All Team Tasks" action={
              <button onClick={() => onAction("Team task created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> New Task</button>
            } />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAF1F8] text-xs text-black/40">
                  <tr>{["Task", "Assignee", "Team", "Priority", "Due", "Status"].map(h => (
                    <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {TEAM_TASKS.map(t => (
                    <tr key={t.id} className="hover:bg-[#EAF1F8]/50">
                      <td className="px-4 py-3 text-xs font-semibold text-black max-w-[220px] truncate">{t.title}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{t.assignee}</td>
                      <td className="px-4 py-3 text-xs text-black/40">{t.team}</td>
                      <td className="px-4 py-3"><Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge></td>
                      <td className="px-4 py-3 text-xs text-black/60">{t.due}</td>
                      <td className="px-4 py-3"><Badge tone={STATUS_TONE[t.status] as "green"|"blue"|"amber"|"red"|"muted"|"violet"}>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {subTab === "Documents" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Team Documents" value="208" delta="28 shared externally" icon={FileText} color="blue" />
            <KpiCard label="New This Week" value="14" delta="Uploaded by team" icon={Plus} color="green" />
            <KpiCard label="Pending Review" value="5" delta="Require approval" positive={false} icon={Clock} color="amber" />
            <KpiCard label="Total Size" value="18.4 GB" delta="Across all teams" icon={Archive} color="violet" />
          </div>
          <Card>
            <CardHeader title="Team Document Library" action={
              <button onClick={() => onAction("Document uploaded")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> Upload</button>
            } />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAF1F8] text-xs text-black/40">
                  <tr>{["Document", "Team", "Type", "Version", "Uploaded By", "Date", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {TEAM_DOCS.map(d => (
                    <tr key={d.id} className="hover:bg-[#EAF1F8]/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                          <span className="text-xs font-semibold text-black truncate max-w-[180px]">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-black/40">{d.team}</td>
                      <td className="px-4 py-3 text-xs text-black/50">{d.type}</td>
                      <td className="px-4 py-3 text-xs text-black/50">{d.version}</td>
                      <td className="px-4 py-3 text-xs text-black/50">{d.uploadedBy}</td>
                      <td className="px-4 py-3 text-xs text-black/50">{d.date}</td>
                      <td className="px-4 py-3"><Badge tone={d.status === "Final" || d.status === "Approved" || d.status === "Published" ? "green" : d.status === "Active" ? "blue" : "amber"}>{d.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => onAction(`Viewed: ${d.id}`)} className="h-7 w-7 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Eye className="h-3 w-3 text-black/40" /></button>
                          <button onClick={() => onAction(`Downloaded: ${d.id}`)} className="h-7 w-7 rounded-lg border border-black/10 grid place-items-center hover:bg-[#EAF1F8]"><Download className="h-3 w-3 text-black/40" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {subTab === "Discussions" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Open Threads" value="12" delta="3 need response" icon={MessageSquare} color="blue" />
            <KpiCard label="My Mentions" value="5" delta="Unread" positive={false} icon={AtSign} color="amber" />
            <KpiCard label="Resolved (MTD)" value="28" delta="Avg. 4h resolution" icon={CheckCircle2} color="green" />
            <KpiCard label="Pinned Topics" value="4" delta="Important discussions" icon={Star} color="violet" />
          </div>
          <Card>
            <CardHeader title="Team Discussions" action={
              <button onClick={() => onAction("New discussion started")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> New Thread</button>
            } />
            <div className="divide-y divide-black/5">
              {[
                { id: "D-001", title: "Evaluation weighting methodology — Solar Mini-Grids", author: "A. Mpofu", team: "TM-001", replies: 8, views: 34, time: "2 hrs ago", pinned: true },
                { id: "D-002", title: "Vendor suspension criteria review", author: "S. Nkosi", team: "TM-005", replies: 5, views: 21, time: "1 day ago", pinned: false },
                { id: "D-003", title: "Q3 budget allocation — infrastructure projects", author: "R. Chikwanda", team: "TM-004", replies: 12, views: 52, time: "2 days ago", pinned: false },
                { id: "D-004", title: "ARV Framework evaluation report sign-off", author: "T. Moyo", team: "TM-002", replies: 3, views: 14, time: "3 days ago", pinned: false },
              ].map(d => (
                <div key={d.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Opened discussion: ${d.id}`)}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {d.pinned && <Star className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />}
                      <div className="text-xs font-semibold text-black">{d.title}</div>
                    </div>
                    <Badge tone="blue">{d.team}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-black/40">
                    <span>{d.author}</span>
                    <span>{d.time}</span>
                    <span>{d.replies} replies</span>
                    <span>{d.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {subTab === "Planning" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Active Sprints" value="3" delta="Across teams" icon={Rocket} color="blue" />
            <KpiCard label="Milestones Due" value="4" delta="This month" icon={Flag} color="amber" />
            <KpiCard label="Resources Assigned" value="28" delta="Across all workstreams" icon={Users} color="green" />
            <KpiCard label="Risks Identified" value="6" delta="2 high-priority" positive={false} icon={AlertTriangle} color="red" />
          </div>
          <Card>
            <CardHeader title="Team Milestones" subtitle="Key delivery milestones across all teams" />
            <div className="divide-y divide-black/5">
              {[
                { milestone: "Solar Mini-Grids — Bid Close", team: "TM-001", date: "2026-06-25", status: "On Track", owner: "T. Moyo" },
                { milestone: "ARV Framework — Evaluation Report Submitted", team: "TM-002", date: "2026-06-15", status: "Completed", owner: "P. Dube" },
                { milestone: "Infrastructure WG — Phase 2 Scope Approval", team: "TM-003", date: "2026-06-30", status: "At Risk", owner: "A. Mpofu" },
                { milestone: "Q3 Budget — Final Submission", team: "TM-004", date: "2026-06-30", status: "On Track", owner: "R. Chikwanda" },
                { milestone: "Vendor Compliance — Batch Q2 Complete", team: "TM-005", date: "2026-06-24", status: "On Track", owner: "S. Nkosi" },
              ].map(m => (
                <div key={m.milestone} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#EAF1F8]/50">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-black">{m.milestone}</div>
                    <div className="text-[10px] text-black/40 mt-0.5">{m.team} · Due {m.date} · {m.owner}</div>
                  </div>
                  <Badge tone={m.status === "Completed" ? "muted" : m.status === "On Track" ? "green" : m.status === "At Risk" ? "red" : "amber"}>{m.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <div>
            <SectionHeader title="Planning Tools" />
            <FeatureGrid items={[
              { icon: Map, title: "Gantt Charts", desc: "Visual project timelines with dependencies", color: "blue" },
              { icon: Kanban, title: "Kanban Boards", desc: "Team-level drag-and-drop task boards", color: "violet" },
              { icon: Rocket, title: "Sprint Planning", desc: "Plan and run agile sprints for procurement tasks", color: "green" },
              { icon: Flag, title: "Milestone Tracker", desc: "Set and monitor key delivery milestones", color: "amber" },
              { icon: Users, title: "Resource Allocation", desc: "Assign and balance workload across members", color: "cyan" },
              { icon: AlertTriangle, title: "Risk Register", desc: "Log, assess and mitigate team-level risks", color: "red" },
            ]} />
          </div>
        </div>
      )}

      {subTab === "Analytics" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Team Velocity" value="78%" delta="+5% vs last month" icon={TrendingUp} color="green" />
            <KpiCard label="Avg. Task Completion" value="4.2 days" delta="Within SLA" icon={Timer} color="blue" />
            <KpiCard label="Collaboration Index" value="91/100" delta="High engagement" icon={Users} color="violet" />
            <KpiCard label="Document Activity" value="64" delta="Actions this week" icon={FileText} color="amber" />
          </div>
          <Card>
            <CardHeader title="Team Collaboration Activity" subtitle="Daily interactions this week" />
            <div className="p-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COLLAB_STATS}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="tasks" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Tasks" />
                  <Bar dataKey="docs" fill="#10B981" radius={[3, 3, 0, 0]} name="Documents" />
                  <Bar dataKey="messages" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Messages" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div>
            <SectionHeader title="Team Analytics Tools" />
            <FeatureGrid items={[
              { icon: BarChart3, title: "Team KPIs", desc: "Real-time KPI dashboards per team", color: "blue" },
              { icon: TrendingUp, title: "Trend Analysis", desc: "Week-on-week and month-on-month trends", color: "green" },
              { icon: PieChart, title: "Workload Distribution", desc: "Visual breakdown of tasks per member", color: "violet" },
              { icon: Trophy, title: "Leaderboards", desc: "Top performers ranked by output metrics", color: "amber" },
              { icon: Activity, title: "Activity Heatmap", desc: "When your team is most productive", color: "cyan" },
              { icon: Download, title: "Export Reports", desc: "Download team performance reports as PDF/Excel", color: "orange" },
            ]} />
          </div>
        </div>
      )}

      {subTab === "Settings" && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Team Settings" subtitle="Configure team preferences and access" />
            <div className="p-5 space-y-4">
              {[
                { label: "Team Notifications", desc: "Receive alerts for all team activity", enabled: true },
                { label: "Task Reminders", desc: "Notify me 24h before task deadlines", enabled: true },
                { label: "Document Alerts", desc: "Alert when new documents are uploaded", enabled: false },
                { label: "Discussion Mentions", desc: "Notify when someone mentions me in a thread", enabled: true },
                { label: "Meeting Invites", desc: "Auto-accept meeting invitations from my teams", enabled: false },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
                  <div>
                    <div className="text-xs font-semibold text-black">{s.label}</div>
                    <div className="text-[10px] text-black/40 mt-0.5">{s.desc}</div>
                  </div>
                  <button onClick={() => onAction(`Toggle: ${s.label}`)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${s.enabled ? "bg-black" : "bg-black/20"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { label: "Create New Team", icon: UserPlus },
                { label: "Export Team Data", icon: Download },
                { label: "Manage Roles", icon: Shield },
                { label: "Archive Team", icon: Archive },
              ].map(a => (
                <button key={a.label} onClick={() => onAction(a.label)}
                  className="h-10 px-3 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-2 hover:border-black/20 transition-colors">
                  <a.icon className="h-3.5 w-3.5 text-black/40" /> {a.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function TeamsPage() {
  const { user } = useAuth();
  const userName = user?.name ?? "T. Moyo";
  const [mainTab, setMainTab] = useState("MY ACTIVITY");
  const [actSubTab, setActSubTab] = useState("Dashboard");
  const [toast, setToast] = useState<string | null>(null);

  function handleAction(msg: string) {
    pushNotification(msg, "info");
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const MAIN_TABS = ["MY ACTIVITY", "MY TEAM"];
  const ACT_TABS = ["Dashboard", "Tasks", "Time & Attendance", "Work Execution", "Communication", "Reporting", "AI Assistant", "Files"];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Collaboration"
        process="Teams & Messaging"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="My Work Space"
          description={`Welcome back, ${userName} — your personal activity hub and team collaboration centre`}
          actions={
            <div className="flex gap-2">
              <button
                className="h-8 px-3 rounded-xl border border-black/10 text-xs font-medium flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors text-black/60 hover:text-black"
                onClick={() => handleAction("Settings opened")}>
                <Settings className="h-3.5 w-3.5" /> Settings
              </button>
            </div>
          }
        />

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-black text-white text-xs px-4 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-bottom-4 duration-200">
            {toast}
          </div>
        )}

        {/* Main tab bar */}
        <div className="flex gap-1 border-b border-black/8 mb-6 overflow-x-auto scrollbar-none">
          {MAIN_TABS.map(tab => (
            <button key={tab} onClick={() => setMainTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                mainTab === tab ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* MY ACTIVITY tab */}
        {mainTab === "MY ACTIVITY" && (
          <div>
            <SubTabBar tabs={ACT_TABS} active={actSubTab} onChange={setActSubTab} />
            {actSubTab === "Dashboard" && <ActivityDashboard onAction={handleAction} userName={userName} />}
            {actSubTab === "Tasks" && <ActivityTasks onAction={handleAction} />}
            {actSubTab === "Time & Attendance" && <ActivityTimeAttendance onAction={handleAction} />}
            {actSubTab === "Work Execution" && <ActivityWorkExecution onAction={handleAction} />}
            {actSubTab === "Communication" && <ActivityCommunication onAction={handleAction} />}
            {actSubTab === "Reporting" && <ActivityReporting onAction={handleAction} />}
            {actSubTab === "AI Assistant" && <ActivityAI onAction={handleAction} />}
            {actSubTab === "Files" && <ActivityFiles onAction={handleAction} />}
          </div>
        )}

        {/* MY TEAM tab */}
        {mainTab === "MY TEAM" && <MyTeamTab onAction={handleAction} />}
      </div>
    </AppShell>
  );
}
