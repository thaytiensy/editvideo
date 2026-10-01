import React from 'react';
import { db } from '../../services/db';
import { 
  Users, DollarSign, Video, ShieldAlert, ArrowUpRight, 
  TrendingUp, Activity, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';

const MRR_DATA = [
  { month: 'Tháng 4', mrr: 48, videos: 420 },
  { month: 'Tháng 5', mrr: 62, videos: 680 },
  { month: 'Tháng 6', mrr: 75, videos: 940 },
  { month: 'Tháng 7', mrr: 91, videos: 1250 },
  { month: 'Tháng 8', mrr: 110, videos: 1680 },
  { month: 'Tháng 9', mrr: 128, videos: 2150 },
  { month: 'Tháng 10', mrr: 146, videos: 2840 },
];

export const AdminOverview: React.FC = () => {
  const users = db.getUsers();
  const templates = db.getTemplates();
  const jobs = db.getJobs();
  const auditLogs = db.getAuditLogs();

  const securityViolations = auditLogs.filter(
    (l) => l.action === 'SECURITY_BLOCK' || l.action === 'USER_BAN'
  );
  const violationRate = ((securityViolations.length / Math.max(auditLogs.length, 1)) * 100).toFixed(1);

  return (
    <div className="space-y-7 text-left">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Tổng Người Dùng</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {(users.length * 342).toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-mono">
              +18.4% <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">38 tài khoản mới hôm nay</div>
        </div>

        {/* Card 2: MRR */}
        <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Doanh Thu MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              146,500,000 đ
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-mono">
              +24.1% <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">Gói PRO & BUSINESS tăng 32%</div>
        </div>

        {/* Card 3: Video Renders Today */}
        <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Video Xuất Hôm Nay</span>
            <Video className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {(jobs.length + 384).toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-mono">
              +12.8% <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">BullMQ throughput: 99.8%</div>
        </div>

        {/* Card 4: Violation Rate */}
        <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Tỉ Lệ Vi Phạm (Chặn AI)</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {violationRate}%
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-mono">
              -0.4% an toàn
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">Chặn người nổi tiếng & &lt;18 tuổi</div>
        </div>
      </div>

      {/* Chart Section: Recharts MRR Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Area Chart MRR */}
        <div className="lg:col-span-8 bg-[#10131d] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Xu Hướng Tăng Trưởng MRR (Triệu VNĐ)</h3>
              <p className="text-xs text-neutral-400">Dữ liệu doanh thu định kỳ từ MoMo & Stripe</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-mono">
              2026 YTD
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MRR_DATA}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2438" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} unit=" tr" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121524',
                    border: '1px solid #282f48',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} Triệu VNĐ`, 'Doanh thu MRR']}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMrr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 cols: Daily Video Renders BarChart */}
        <div className="lg:col-span-4 bg-[#10131d] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Sản Lượng Video</h3>
              <p className="text-xs text-neutral-400">Số lượng video hoàn tất</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MRR_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2438" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121524',
                    border: '1px solid #282f48',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="videos" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Security & Audit Logs */}
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Nhật Ký An Ninh & Kiểm Soát (Audit Logs)</h3>
            <p className="text-xs text-neutral-400">Giám sát các hành động nhạy cảm, chặn xâm phạm bản quyền</p>
          </div>
          <span className="text-xs font-mono text-neutral-400">{auditLogs.length} sự kiện</span>
        </div>

        <div className="divide-y divide-neutral-800/70 text-xs">
          {auditLogs.slice(0, 6).map((log) => {
            const isBlock = log.action === 'SECURITY_BLOCK' || log.action === 'USER_BAN';
            return (
              <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#141828]/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isBlock ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}
                  >
                    {isBlock ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{log.actorEmail}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {log.action}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {JSON.stringify(log.meta)}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-neutral-500">
                  {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
