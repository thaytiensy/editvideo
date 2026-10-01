import React, { useState } from 'react';
import { db } from '../../services/db';
import { User, UserPlan, AuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Shield, Ban, CheckCircle, Search, 
  History, X, Eye, FileText, AlertTriangle 
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [search, setSearch] = useState('');
  
  // Selected user for audit history modal
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<User | null>(null);
  const [userAuditLogs, setUserAuditLogs] = useState<AuditLog[]>([]);

  const reload = () => {
    setUsers(db.getUsers());
    refreshUserData();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const handlePlanChange = (userId: string, newPlan: UserPlan) => {
    const quota = newPlan === 'PRO' ? 100 : newPlan === 'BUSINESS' ? 500 : 5;
    db.updateUser(userId, { plan: newPlan, monthlyQuota: quota });
    db.logAudit({
      actorId: currentUser?.id || 'admin',
      actorEmail: currentUser?.email || 'thaytiensy@gmail.com',
      action: 'FACE_SWAP',
      targetUserId: userId,
      meta: { event: 'PLAN_CHANGE_BY_ADMIN', newPlan, newQuota: quota },
    });
    reload();
  };

  const handleToggleBan = (user: User) => {
    const nextBanned = !user.isBanned;
    db.updateUser(user.id, { isBanned: nextBanned });
    db.logAudit({
      actorId: currentUser?.id || 'admin',
      actorEmail: currentUser?.email || 'thaytiensy@gmail.com',
      action: 'USER_BAN',
      targetUserId: user.id,
      meta: { action: nextBanned ? 'BAN_USER' : 'UNBAN_USER', email: user.email },
    });
    reload();
  };

  const handleViewFaceSwapLogs = (user: User) => {
    setSelectedUserForLogs(user);
    const logs = db
      .getAuditLogs()
      .filter((l) => l.actorId === user.id || l.targetUserId === user.id);
    setUserAuditLogs(logs);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Quản Lý Người Dùng & Nhật Ký Ghép Mặt</span>
            <span className="text-xs font-mono text-neutral-400">({users.length} tài khoản)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Nâng/hạ gói trực tiếp · Khóa tài khoản vi phạm · Tra cứu nhật ký "Ai ghép mặt ai"
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full bg-[#121420] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141724] text-neutral-400 font-medium border-b border-neutral-800">
              <tr>
                <th className="py-3 px-5">Người dùng</th>
                <th className="py-3 px-5">Số điện thoại</th>
                <th className="py-3 px-5">Vai trò</th>
                <th className="py-3 px-5">Gói (Plan)</th>
                <th className="py-3 px-5">Lượt Render</th>
                <th className="py-3 px-5">Trạng thái</th>
                <th className="py-3 px-5 text-right">Tra cứu Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#141828]/50 transition-colors">
                  <td className="py-3 px-5 flex items-center gap-3">
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] text-indigo-400 font-mono">(Bạn)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                    </div>
                  </td>

                  <td className="py-3 px-5 font-mono text-neutral-300">{u.phone}</td>

                  <td className="py-3 px-5">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {u.role}
                    </span>
                  </td>

                  {/* Plan dropdown switcher */}
                  <td className="py-3 px-5">
                    <select
                      value={u.plan}
                      onChange={(e) => handlePlanChange(u.id, e.target.value as UserPlan)}
                      className="bg-[#151928] border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs font-mono font-medium outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="FREE">FREE (5 vid)</option>
                      <option value="PRO">PRO (100 vid)</option>
                      <option value="BUSINESS">BUSINESS (500 vid)</option>
                    </select>
                  </td>

                  <td className="py-3 px-5 font-mono text-neutral-300 tabular-nums">
                    {u.videosRenderedCount} / {u.monthlyQuota}
                  </td>

                  {/* Ban/Unban status button */}
                  <td className="py-3 px-5">
                    <button
                      type="button"
                      onClick={() => handleToggleBan(u)}
                      className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                        u.isBanned
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                      }`}
                    >
                      {u.isBanned ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      <span>{u.isBanned ? 'Đã khóa' : 'Hoạt động'}</span>
                    </button>
                  </td>

                  {/* View Log Button */}
                  <td className="py-3 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleViewFaceSwapLogs(u)}
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Log Ghép Mặt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log "Ai Ghép Mặt Ai" Modal */}
      {selectedUserForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#10131d] border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedUserForLogs(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Nhật Ký "Ai Ghép Mặt Ai" · {selectedUserForLogs.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  Email: {selectedUserForLogs.email} · Số sự kiện ghi nhận: {userAuditLogs.length}
                </p>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-neutral-800 text-xs">
              {userAuditLogs.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">
                  Người dùng này chưa có lượt ghép mặt hoặc sự kiện bảo mật nào.
                </div>
              ) : (
                userAuditLogs.map((log) => (
                  <div key={log.id} className="py-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-indigo-300">
                          {log.action}
                        </span>
                        <span>{log.actorEmail}</span>
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <pre className="p-2.5 bg-[#141724] rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(log.meta, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForLogs(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
