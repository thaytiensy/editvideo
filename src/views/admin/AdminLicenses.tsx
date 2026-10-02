import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Clock, 
  User, 
  DollarSign, 
  RefreshCw,
  Lock,
  Unlock,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { db } from '../../services/db';
import { AppLicense } from '../../types';

export const AdminLicenses: React.FC = () => {
  const [licenses, setLicenses] = useState<AppLicense[]>([]);
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmailOrPhone, setNewEmailOrPhone] = useState('');
  const [newPlan, setNewPlan] = useState<AppLicense['plan']>('1_MONTH');
  const [newDays, setNewDays] = useState(30);
  const [newNotes, setNewNotes] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    setLicenses(db.getLicenses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggle = (id: string) => {
    db.toggleLicense(id);
    loadData();
  };

  const handleRevoke = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn thu hồi bản quyền này? Khách hàng sẽ bị khóa app ngay lập tức!')) {
      db.revokeLicense(id);
      loadData();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Xóa hẳn license này khỏi danh sách?')) {
      db.deleteLicense(id);
      loadData();
    }
  };

  const handleCreateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailOrPhone.trim()) {
      alert('Vui lòng nhập Số điện thoại hoặc Gmail của khách hàng!');
      return;
    }
    const created = db.createLicense({
      email_or_phone: newEmailOrPhone.trim(),
      plan: newPlan,
      duration_days: newDays,
      notes: newNotes.trim()
    });
    setIsCreateOpen(false);
    setNewEmailOrPhone('');
    setNewNotes('');
    loadData();
    handleCopy(created.licenseKey);
    alert(`Đã tạo thành công License: ${created.licenseKey}\n(Đã tự động sao chép vào bộ nhớ tạm để gửi cho khách!)`);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!oldPassword || !newPassword) {
      setPassMsg({ type: 'error', text: 'Vui lòng điền đầy đủ mật khẩu cũ và mới' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Xác nhận mật khẩu mới không trùng khớp' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới tối thiểu 6 ký tự' });
      return;
    }

    const adminUser = db.getUsers().find(u => u.email === 'admin' || u.role === 'ADMIN');
    if (!adminUser) {
      setPassMsg({ type: 'error', text: 'Không tìm thấy tài khoản admin' });
      return;
    }

    const currentHash = adminUser.passwordHash || (adminUser.email === 'admin' ? '123456' : '12345678');
    if (oldPassword !== currentHash) {
      setPassMsg({ type: 'error', text: 'Mật khẩu cũ không chính xác' });
      return;
    }

    db.updateUser(adminUser.id, { passwordHash: newPassword });
    setPassMsg({ type: 'success', text: 'Đổi mật khẩu tài khoản Admin thành công! Mật khẩu mới đã được lưu.' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const filtered = licenses.filter(l => 
    l.licenseKey.toLowerCase().includes(search.toLowerCase()) ||
    l.customerContact.toLowerCase().includes(search.toLowerCase()) ||
    l.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = licenses.filter(l => l.status === 'ACTIVE').length;
  const revokedCount = licenses.filter(l => l.status === 'REVOKED').length;

  return (
    <div className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232638] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Tổng License Cấp Ra</span>
            <span className="text-lg font-bold text-white">{licenses.length} Key</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232638] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Đang Hoạt Động (Active)</span>
            <span className="text-lg font-bold text-emerald-400">{activeCount} Khách</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232638] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Đã Thu Hồi / Khóa</span>
            <span className="text-lg font-bold text-red-400">{revokedCount} Khách</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141622] border border-[#232638] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Doanh Thu Ước Tính</span>
            <span className="text-lg font-bold text-purple-300">
              {(activeCount * 499000).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      </div>

      {/* Main License Management Table Section */}
      <div className="bg-[#12131b] border border-[#232532] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Danh Sách License Bán Cho Khách Hàng (Định dạng SY-XXXX-XXXX)</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Tạo mã bản quyền gửi khách, quản lý kích hoạt, bật/tắt hoặc thu hồi bản quyền từ xa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã SY-..., SĐT, Gmail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#171924] border border-[#272a38] text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 w-52 transition-colors"
              />
            </div>

            {/* Create License Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo License Mới</span>
            </button>
          </div>
        </div>

        {/* License Table */}
        <div className="overflow-x-auto rounded-xl border border-[#232532]">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#171822] text-neutral-400 font-medium border-b border-[#232532] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã License Key</th>
                <th className="py-3 px-4">Khách Hàng (SĐT/Gmail)</th>
                <th className="py-3 px-4">Gói Bản Quyền</th>
                <th className="py-3 px-4">Hạn Sử Dụng</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e202c]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                    Không tìm thấy license nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((lic) => {
                  const isRevoked = lic.status === 'REVOKED';
                  const isExpired = lic.expiresAt !== 'NEVER' && new Date(lic.expiresAt).getTime() < Date.now();
                  const isCopied = copiedKey === lic.licenseKey;

                  return (
                    <tr key={lic.id} className="hover:bg-[#161823] transition-colors">
                      {/* Key */}
                      <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                        <span className="bg-[#1e2130] px-2 py-0.5 rounded border border-[#2e3248] text-indigo-300">
                          {lic.licenseKey}
                        </span>
                        <button
                          onClick={() => handleCopy(lic.licenseKey)}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          title="Sao chép License Key gửi khách"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-200">{lic.customerContact}</div>
                        {lic.notes && <div className="text-[10px] text-neutral-500 mt-0.5">{lic.notes}</div>}
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lic.plan === 'LIFETIME'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : lic.plan === '1_YEAR'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {lic.plan === 'LIFETIME' ? 'VĨNH VIỄN' : lic.plan === '1_YEAR' ? '1 NĂM' : '1 THÁNG'}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-300">
                        {lic.expiresAt === 'NEVER' ? (
                          <span className="text-purple-300 font-semibold">Trọn Đời</span>
                        ) : (
                          new Date(lic.expiresAt).toLocaleDateString('vi-VN')
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isRevoked ? (
                          <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold flex items-center gap-1 w-max">
                            <ShieldAlert className="w-3 h-3" /> ĐÃ THU HỒI
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> HẾT HẠN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3" /> HOẠT ĐỘNG
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleToggle(lic.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                            isRevoked
                              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                              : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
                          }`}
                          title={isRevoked ? "Kích hoạt lại bản quyền" : "Tạm ngưng/Khóa bản quyền"}
                        >
                          {isRevoked ? "Mở Khóa" : "Tắt / Khóa"}
                        </button>

                        <button
                          onClick={() => handleRevoke(lic.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/60 transition-colors"
                          title="Thu hồi vĩnh viễn"
                        >
                          Thu Hồi
                        </button>

                        <button
                          onClick={() => handleDelete(lic.id)}
                          className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Xóa hẳn khỏi bảng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Password Change Card */}
      <div className="bg-[#12131b] border border-[#232532] rounded-2xl p-5 max-w-xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Đổi Mật Khẩu Tài Khoản Quản Trị (Admin)</h3>
        </div>
        <p className="text-[11px] text-neutral-400">
          Tài khoản mặc định: <strong className="text-white">admin</strong> · Mật khẩu mặc định: <strong className="text-white">123456</strong>.
          Bạn có thể đổi mật khẩu mới tại đây:
        </p>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập 123456..."
              className="w-full px-3 py-1.5 rounded-xl bg-[#171924] border border-[#272a38] text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#171924] border border-[#272a38] text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#171924] border border-[#272a38] text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {passMsg && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              passMsg.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-red-950/40 text-red-300 border border-red-800/40'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Cập Nhật Mật Khẩu Admin
            </button>
          </div>
        </form>
      </div>

      {/* Create License Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-[#14151e] border border-[#282b3a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#232532] flex items-center justify-between bg-[#171824]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Tạo Mã License SY-XXXX-XXXX Cho Khách</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Số Điện Thoại Hoặc Gmail Của Khách Hàng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 0987654321 hoặc khachhang@gmail.com"
                  value={newEmailOrPhone}
                  onChange={(e) => setNewEmailOrPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181a25] border border-[#2b2e3e] text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Chọn Gói Bản Quyền
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1_MONTH', label: '1 Tháng', days: 30 },
                    { id: '1_YEAR', label: '1 Năm', days: 365 },
                    { id: 'LIFETIME', label: 'Vĩnh Viễn', days: 9999 },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setNewPlan(p.id as any);
                        setNewDays(p.days);
                      }}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                        newPlan === p.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                          : 'bg-[#181a25] border-[#292c3a] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Ghi chú đơn hàng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: Chuyển khoản Techcombank 499k..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181a25] border border-[#2b2e3e] text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#171924] border border-[#262836] text-[11px] text-neutral-400">
                <span>💡 Mã sinh ra sẽ có định dạng chuẩn: </span>
                <strong className="text-indigo-400 font-mono">SY-XXXX-XXXX</strong>.
                <span> Khi tạo xong mã sẽ tự động copy để gửi cho khách.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
                >
                  Tạo & Sao Chép Mã Gửi Khách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
