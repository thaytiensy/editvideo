import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, UserRole, UserPlan } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isShopOwner: boolean;
  canEdit: boolean;
  allUsers: User[];
  loginWithGoogle: (customEmail?: string) => Promise<boolean>;
  loginWithEmailOrPhone: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    phone: string;
    name: string;
    role?: UserRole;
    plan?: UserPlan;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sendPasswordResetOtp: (email: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyOtpAndResetPassword: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => void;
  updatePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  switchUser: (userId: string) => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const currentId = db.getCurrentUserId();
    return db.getUser(currentId) || db.getUserByEmail('thaytiensy@gmail.com') || db.getUsers()[0] || null;
  });

  const [otpStore, setOtpStore] = useState<Record<string, { code: string; expiresAt: number }>>({});

  const refreshUserData = () => {
    if (currentUser) {
      const fresh = db.getUser(currentUser.id);
      if (fresh) setCurrentUser(fresh);
    }
  };

  useEffect(() => {
    if (currentUser) {
      db.setCurrentUserId(currentUser.id);
    }
  }, [currentUser]);

  const loginWithGoogle = async (customEmail?: string): Promise<boolean> => {
    // 1-tap Google OAuth simulation - defaults to admin thaytiensy@gmail.com
    const email = customEmail || 'thaytiensy@gmail.com';
    let user = db.getUserByEmail(email);

    if (!user) {
      user = db.createUser({
        email,
        phone: '0909000001',
        name: 'Thầy Tiến Sỹ (Super Admin PRO)',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        role: 'ADMIN',
        plan: 'PRO',
        shopId: 'shop-zen-1',
        passwordHash: '12345678',
        monthlyQuota: 9999,
      });
    }

    if (user.isBanned) {
      throw new Error('Tài khoản của bạn đã bị khóa do vi phạm điều khoản.');
    }

    setCurrentUser(user);
    db.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'FACE_SWAP',
      meta: { method: 'GOOGLE_OAUTH_1_TAP' },
    });
    return true;
  };

  const loginWithEmailOrPhone = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = db.verifyCredentials(identifier, pass);
    if (!res.success || !res.user) {
      return { success: false, error: res.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại mật khẩu.' };
    }
    setCurrentUser(res.user);
    db.setCurrentUserId(res.user.id);
    return { success: true };
  };

  const loginWithPhone = async (phone: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    return loginWithEmailOrPhone(phone, pass);
  };

  const register = async (data: {
    email: string;
    phone: string;
    name: string;
    role?: UserRole;
    plan?: UserPlan;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (db.getUserByEmail(data.email)) {
      return { success: false, error: 'Email đã tồn tại trên hệ thống.' };
    }
    if (db.getUserByPhone(data.phone)) {
      return { success: false, error: 'Số điện thoại đã được đăng ký.' };
    }

    const newUser = db.createUser({
      email: data.email,
      phone: data.phone,
      name: data.name,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
      role: data.role || 'SHOP_OWNER',
      plan: 'PRO', // All users default to PRO
      shopId: 'shop-zen-1',
      passwordHash: data.password || '12345678',
      monthlyQuota: 9999,
    });

    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // 6-digit OTP reset via Gmail
  const sendPasswordResetOtp = async (email: string) => {
    const user = db.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Không tìm thấy tài khoản với email này trên hệ thống.' };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpStore((prev) => ({
      ...prev,
      [email]: { code, expiresAt: Date.now() + 5 * 60 * 1000 },
    }));

    return { success: true, otp: code };
  };

  const verifyOtpAndResetPassword = async (email: string, otp: string, newPass: string) => {
    const record = otpStore[email];
    if (!record) {
      return { success: false, error: 'Chưa có yêu cầu gửi mã OTP cho email này.' };
    }
    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'Mã OTP đã hết hạn sau 5 phút. Vui lòng gửi lại.' };
    }
    if (record.code !== otp.trim()) {
      return { success: false, error: 'Mã OTP không chính xác.' };
    }

    const user = db.getUserByEmail(email);
    if (!user) return { success: false, error: 'Người dùng không tồn tại.' };

    db.updateUser(user.id, { passwordHash: newPass });
    const fresh = db.getUser(user.id);
    if (currentUser?.id === user.id && fresh) {
      setCurrentUser(fresh);
    }

    return { success: true };
  };

  const updateProfile = (data: { name?: string; avatarUrl?: string }) => {
    if (!currentUser) return;
    const updated = db.updateUser(currentUser.id, data);
    setCurrentUser(updated);
  };

  const updatePassword = async (newPass: string) => {
    if (!currentUser) return { success: false, error: 'Chưa đăng nhập' };
    const updated = db.updateUser(currentUser.id, { passwordHash: newPass });
    setCurrentUser(updated);
    return { success: true };
  };

  const switchUser = (userId: string) => {
    const target = db.getUser(userId);
    if (target) {
      setCurrentUser(target);
      db.setCurrentUserId(target.id);
    }
  };

  const role = currentUser?.role || 'VIEWER';
  const isAdmin = role === 'ADMIN';
  const isShopOwner = role === 'SHOP_OWNER' || role === 'ADMIN';
  const canEdit = role === 'ADMIN' || role === 'SHOP_OWNER' || role === 'EDITOR';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin,
        isShopOwner,
        canEdit,
        allUsers: db.getUsers(),
        loginWithGoogle,
        loginWithEmailOrPhone,
        loginWithPhone,
        register,
        logout,
        sendPasswordResetOtp,
        verifyOtpAndResetPassword,
        updateProfile,
        updatePassword,
        switchUser,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
