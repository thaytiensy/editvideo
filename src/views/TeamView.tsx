import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { ShareInvite, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { 
  Users, Mail, UserPlus, Shield, CheckCircle2, Clock, Trash2, 
  Check, AlertCircle, Send, ExternalLink, Sparkles, Key, Zap
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const { currentUser, isShopOwner, refreshUserData } = useAuth();
  const { currentShop } = useBrand();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [customNote, setCustomNote] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Shop members
  const teamMembers = useMemo(() => {
    return db.getUsers().filter((u) => u.shopId === (currentUser?.shopId || 'shop-zen-1'));
  }, [currentUser?.shopId]);

  // Invites list
  const [invites, setInvites] = useState<ShareInvite[]>(() => {
    return db.getInvites(currentUser?.shopId || 'shop-zen-1');
  });

  const reloadInvites = () => {
    setInvites(db.getInvites(currentUser?.shopId || 'shop-zen-1'));
  };

  const handleSendGmailInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = inviteEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail hợp lệ.');
      return;
    }

    if (teamMembers.some((m) => m.email.toLowerCase() === emailTrimmed.toLowerCase())) {
      setErrorMsg('Thành viên với email này đã có trong đội ngũ Studio.');
      return;
    }

    // 1. Create user & grant PRO access in local db immediately
    db.addAuthorizedGmail(emailTrimmed, emailTrimmed.split('@')[0], inviteRole);
    const created = db.createInvite({
      shopId: currentUser?.shopId || 'shop-zen-1',
      shopName: currentShop?.name || 'Tiến Sỹ PRO Studio',
      invitedEmail: emailTrimmed,
      invitedByUserId: currentUser?.id || 'user-admin-tiensy',
      role: inviteRole,
    });

    // 2. Compose Gmail sharing link from admin thaytiensy@gmail.com
    const subject = `[Art Video PRO] Lời mời tham gia nhóm sáng tạo video AI từ Admin thaytiensy@gmail.com`;
    const body = `Xin chào,\n\nAdmin Thầy Tiến Sỹ (thaytiensy@gmail.com) trân trọng gửi lời mời bạn tham gia nhóm làm video AI Art Video Maker PRO với gói quyền lợi PRO Không Giới Hạn.\n\nThông tin đăng nhập tài khoản của bạn:\n- Địa chỉ Email: ${emailTrimmed}\n- Mật khẩu đăng nhập mặc định: 12345678\n- Quyền hạn: ${inviteRole === 'EDITOR' ? 'Biên Tập Viên PRO (Toàn quyền render video)' : 'Người Xem PRO'}\n- Link đăng nhập hệ thống: ${window.location.origin}\n\n* LƯU Ý QUAN TRỌNG: Sau khi đăng nhập bằng mật khẩu 12345678, bạn vui lòng vào mục "Cài Đặt" để đổi mật khẩu cá nhân bảo mật.\n${customNote ? `\nLời nhắn từ Admin: "${customNote}"\n` : ''}\nTrân trọng,\nAdmin Thầy Tiến Sỹ\nEmail: thaytiensy@gmail.com\nArt Video Maker PRO Team`;

    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTrimmed)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(emailTrimmed)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Try opening Gmail Web in a new tab
    const win = window.open(gmailWebUrl, '_blank');
    if (!win) {
      // Fallback mailto
      window.location.href = mailtoUrl;
    }

    reloadInvites();
    refreshUserData();
    setInviteEmail('');
    setCustomNote('');
    setSuccessMsg(`Đã tạo tài khoản PRO và mở Gmail soạn thư gửi tới ${emailTrimmed}! Mật khẩu cấp: 12345678.`);
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  const handleOpenDirectGmail = (memberEmail: string) => {
    const subject = `[Art Video PRO] Trao đổi công việc từ Admin thaytiensy@gmail.com`;
    const body = `Chào bạn,\n\nAdmin Thầy Tiến Sỹ (thaytiensy@gmail.com) liên hệ trao đổi về dự án video ghép mặt AI trên Art Video Maker PRO.\n\nTrân trọng,\nThầy Tiến Sỹ (thaytiensy@gmail.com)`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(memberEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleRemoveMember = (userId: string, email: string) => {
    if (email.toLowerCase() === 'thaytiensy@gmail.com') {
      alert('Không thể xóa tài khoản Super Admin.');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên ${email} khỏi nhóm?`)) {
      const users = db.getUsers().filter((u) => u.id !== userId);
      localStorage.setItem('avm_users', JSON.stringify(users));
      refreshUserData();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-16 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Chia Sẻ Gmail & Quản Trị Đội Ngũ (PRO)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              PRO UNLIMITED
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Toàn bộ chức năng chia sẻ được thực hiện qua Gmail chính thức của Admin: <strong className="text-indigo-300">thaytiensy@gmail.com</strong>
          </p>
        </div>

        {/* Admin contact pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121524] border border-neutral-800 rounded-xl text-xs">
          <Mail className="w-4 h-4 text-red-400" />
          <span className="text-neutral-400">Admin Gmail:</span>
          <span className="font-mono text-white font-semibold">thaytiensy@gmail.com</span>
        </div>
      </div>

      {/* Admin Notice Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-[#15192e] to-purple-950/30 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <span>Hệ Thống Chia Sẻ Gmail Chính Thức - Điều Hành Bởi Admin Thầy Tiến Sỹ</span>
              <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono text-[9px]">GMAIL VERIFIED</span>
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Mật khẩu mặc định cấp cho thành viên mới là <strong className="text-white font-mono">12345678</strong>. Sau khi đăng nhập, thành viên và Admin có thể trực tiếp đổi mật khẩu riêng tại trang Cài Đặt.
            </p>
          </div>
        </div>
      </div>

      {/* Gmail Invite Form */}
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Mời Thành Viên Mới Qua Gmail (Admin: thaytiensy@gmail.com)</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Gói PRO Không Giới Hạn
          </span>
        </div>

        <form onSubmit={handleSendGmailInvite} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label className="text-[11px] text-neutral-400 block mb-1">
                Địa chỉ Gmail người nhận:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="dongnghiep@gmail.com"
                  className="w-full bg-[#151928] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="text-[11px] text-neutral-400 block mb-1">
                Vai trò truy cập:
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="EDITOR">Biên Tập Viên PRO (Toàn quyền render)</option>
                <option value="VIEWER">Người Xem PRO (Chỉ xem và tải video)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Lời nhắn gửi kèm từ Admin (Tùy chọn):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="VD: Chào bạn, mình gửi bạn tài khoản Studio PRO làm video chiến dịch mới..."
              className="w-full bg-[#151928] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
            />
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-neutral-400">
              * Tự động mở Gmail soạn thư kèm mật khẩu mặc định <strong>12345678</strong>
            </span>
            <button
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Mở Gmail Gửi Lời Mời & Kích Hoạt PRO</span>
            </button>
          </div>
        </form>
      </div>

      {/* Team Members List */}
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Danh Sách Thành Viên Studio ({teamMembers.length})
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">Tất cả thành viên đều được nâng cấp PRO</span>
        </div>

        <div className="divide-y divide-neutral-800/80">
          {teamMembers.map((member) => {
            const isAdminMember = member.email.toLowerCase() === 'thaytiensy@gmail.com';
            return (
              <div key={member.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#131627] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span className="truncate">{member.name}</span>
                      {isAdminMember && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                          SUPER ADMIN
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                        PRO
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono truncate">
                      {member.email} · {member.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenDirectGmail(member.email)}
                    className="py-1.5 px-3 bg-[#181c2e] hover:bg-[#20263e] border border-neutral-700/80 rounded-lg text-xs text-indigo-300 flex items-center gap-1.5 transition-colors"
                    title="Gửi Gmail từ Admin thaytiensy@gmail.com"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline">Gửi Gmail</span>
                  </button>

                  {!isAdminMember && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id, member.email)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Xóa thành viên"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
