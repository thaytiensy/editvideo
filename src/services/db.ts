import { 
  User, Shop, Template, VideoJob, ShareInvite, AuditLog, PricingConfig, Industry, AppLicense 
} from '../types';

const STORAGE_KEYS = {
  USERS: 'avm_users',
  SHOPS: 'avm_shops',
  TEMPLATES: 'avm_templates',
  JOBS: 'avm_jobs',
  INVITES: 'avm_invites',
  AUDIT_LOGS: 'avm_audit_logs',
  PRICING: 'avm_pricing',
  CURRENT_USER_ID: 'avm_curr_user_id',
  RATE_LIMITS: 'avm_rate_limits',
  LICENSES: 'avm_app_licenses',
  ACTIVE_LICENSE_KEY: 'avm_active_license_key',
  AI_KEYS: 'avm_ai_cloud_keys',
};

// Seed 20 templates per industry = 80 templates (4 core commercial industries)
const generateSeedTemplates = (): Template[] => {
  return [];
  const industries: Industry[] = ['NOITHAT', 'THOITRANG', 'MYPHAM', 'GIADUNG'];
  const titlesByIndustry: Record<Industry, string[]> = {
    NOITHAT: [
      'Minimalist Nordic Living Room Tour',
      'Luxury Italian Villa Dining Hall',
      'Modern Japandi Master Bedroom Showcase',
      'Industrial Loft Kitchen Transformation',
      'Warm Contemporary Sofa & Lounge Reel',
      'Smart Office Ergonomic Workstation',
      'Art Deco Penthouse Terrace Lounge',
      'Monochrome Marble Bathroom Suite',
      'Eco-Friendly Bamboo Interior Staging',
      'Boutique Hotel Lobby & Chandelier Staging',
      'Scandinavian Cozy Reading Corner',
      'Minimalist Walk-in Closet Reveal',
      'Open Space Studio Apartment Decor',
      'Architectural Concrete & Wood Villa',
      'Mid-Century Modern Credenza & Lamp',
      'Modern Zen Garden Villa Walkthrough',
      'Executive Leather Desk & Library',
      'Boho-Chic Rattan Sunroom Inspiration',
      'High-Ceiling Duplex Chandelier Spotlight',
      'Smart Home Integrated Furniture Suite',
    ],
    THOITRANG: [
      'High-Fashion Paris Runway Walk 9:16',
      'Cyberpunk Neon Streetwear Reel',
      'Luxury Silk Evening Gown Slow Motion',
      'Autumn Trench Coat Urban Editorial',
      'Y2K Denim Jacket & Cargo Pants Flare',
      'Minimalist Linen Summer Collection',
      'Oversized Hoodie & Sneakerhead Drop',
      'Haute Couture Velvet Blazer Spotlight',
      'Sporty Athleisure Gym & Yoga Fit',
      'Vintage 90s Leather Jacket Stroll',
      'Retro Tweed Suit Parisian Cafe Shoot',
      'Futuristic Metallic Puffer Fashion Look',
      'Boho Floral Spring Maxi Dress Walk',
      'Luxury Cashmere Sweater Cinematic Close-up',
      'Gen Z Graphic Tee Street Style',
      'Monochrome Black Trench & Sunglasses',
      'Luxury Swimwear Resort Sunset Editorial',
      'Contemporary Kimono Fusion Outerwear',
      'Goth-Chic Avant-Garde Runway Model',
      'Smart Casual Techwear Hybrid Coat',
    ],
    MYPHAM: [
      'Glow Vitamin C Serum Dropper Drop Reel',
      'Velvet Matte Lip Tint 8-Shade Swatch',
      'Water-Burst Hyaluronic Acid Cream Glow',
      'Anti-Aging Retinol Night Routine Cinematic',
      'Sunscreen Invisible Water Gel Application',
      'Luxury Rose Water Mist Ultra-HD Spray',
      'Glass Skin Facial Cleansing Foam ASMR',
      'Golden Elixir Hair Oil Radiant Shine',
      'Natural Cushion Compact Before/After Glow',
      'Charcoal Clay Mask Deep Pore Detox',
      'Collagen Peptide Eye Cream Smooth Touch',
      'Hydrating Lip Sleeping Mask Glossy Finish',
      'Botanical Centella Soothing Serum Frame',
      'Shimmer Body Oil Golden Hour Spotlight',
      'Gentle Micro-Exfoliating Toner Swipe',
      'Luxury Perfume Bottle Mist Slow-mo',
      'Peptide Firming Sculpting Roller Demo',
      'Color-Changing Blush Oil Cheek Glow',
      'Cica Barrier Repair Moisture Shield',
      'Diamond Dust Highlighter Cheekbone Shine',
    ],
    GIADUNG: [
      'Smart Air Fryer Crispy Salmon Demo 4K',
      'Robot Vacuum Smart LiDAR Mapping Reel',
      'Cordless Ultra-Suction Vacuum Carpet Clean',
      'Multi-Function Blender Smoothie Cyclone',
      'Automatic Espresso Maker Crema Extraction',
      'Induction Cooktop Rapid Water Boil Test',
      'Quiet Ionic Hairdryer Fast Drying Magic',
      'Smart Air Purifier Smoke Clear Chamber',
      'High-Speed Garment Steamer Silk Smoothing',
      'Touchless Sensor Trash Can Kitchen Ease',
      'Electric Toothbrush Sonic Wave Vibration',
      'Instant Hot Water Dispenser LED Preset',
      'Smart Dishwasher Sparkling Glass Test',
      'Cast Iron Dutch Oven Sourdough Bake',
      'Mini Portable Ice Maker Rapid Bullet Ice',
      'Electric Massage Gun Deep Tissue Therapy',
      'Smart Plant Moisture Monitor & Waterer',
      'Dual-Zone Wine Cooler Bottle Selection',
      'Rechargeable Lint Shaver Wool Revival',
      'Aromatherapy Ultrasonic Humidifier Mist',
    ],
  };

  const templates: Template[] = [];
  let idCounter = 1;

  // Realistic sample mp4 clips for video preview
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  ];

  industries.forEach((ind) => {
    titlesByIndustry[ind].forEach((title, index) => {
      const vidUrl = sampleVideos[index % sampleVideos.length];
      const maxFaces = 5; // PRO mode unlocked: up to 5 faces
      const aspectRatio = index % 3 === 0 ? '9:16' : index % 3 === 1 ? '16:9' : '1:1';
      
      templates.push({
        id: `tpl-${ind.toLowerCase()}-${idCounter++}`,
        industry: ind,
        title,
        videoUrl: vidUrl,
        thumbUrl: `https://images.unsplash.com/photo-${1500000000000 + idCounter * 8374}?auto=format&fit=crop&w=600&q=80`,
        aspectRatio,
        durationSeconds: 15 + (index % 4) * 5,
        maxFaces,
        isActive: true,
        createdByAdminId: 'user-admin-tiensy',
        tags: [ind.toLowerCase(), 'trending', 'ai-face-swap', 'commercial', 'pro'],
        viewCount: 1400 + index * 123,
        createdAt: new Date(Date.now() - (80 - idCounter) * 86400000).toISOString(),
      });
    });
  });

  return templates;
};

// Initial Seed Data with Admin thaytiensy@gmail.com
const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop-zen-1',
    name: 'Tiến Sỹ PRO Studio & Media',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    primaryColor: '#6366f1',
    watermarkText: 'Art Video PRO • thaytiensy@gmail.com',
    ownerId: 'user-admin-tiensy',
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-root',
    email: 'admin',
    phone: '0900000000',
    name: 'Admin Quản Trị Hệ Thống',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'ADMIN',
    plan: 'PRO',
    shopId: 'shop-zen-1',
    passwordHash: '123456',
    videosRenderedCount: 9999,
    monthlyQuota: 9999,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-admin-tiensy',
    email: 'thaytiensy@gmail.com',
    phone: '0909000001',
    name: 'Thầy Tiến Sỹ (Super Admin PRO)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'ADMIN',
    plan: 'PRO',
    shopId: 'shop-zen-1',
    passwordHash: '12345678',
    videosRenderedCount: 142,
    monthlyQuota: 9999,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'user-owner-1',
    email: 'owner@zenfashion.vn',
    phone: '0909000002',
    name: 'Minh Trí (Shop Owner PRO)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'SHOP_OWNER',
    plan: 'PRO',
    shopId: 'shop-zen-1',
    passwordHash: '12345678',
    videosRenderedCount: 38,
    monthlyQuota: 9999,
    createdAt: '2026-02-01T09:30:00.000Z',
  },
  {
    id: 'user-editor-1',
    email: 'editor@zenfashion.vn',
    phone: '0909000003',
    name: 'Hà Linh (Video Editor PRO)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'EDITOR',
    plan: 'PRO',
    shopId: 'shop-zen-1',
    passwordHash: '12345678',
    videosRenderedCount: 19,
    monthlyQuota: 9999,
    createdAt: '2026-02-15T14:10:00.000Z',
  },
];

const INITIAL_PRICING: PricingConfig[] = [
  {
    id: 'plan-pro-lifetime',
    plan: 'PRO',
    name: 'Gói PRO Không Giới Hạn (Đã Nâng Cấp)',
    priceVND: 0,
    priceUSD: 0,
    videoLimitPerMonth: 9999,
    maxFacesPerVideo: 5,
    watermarkCustom: true,
    teamSeats: 999,
    recommended: true,
    features: [
      'Không giới hạn lượt render video AI (Quota 9999/tháng)',
      'Ghép tối đa 5 khuôn mặt đồng thời chuẩn HD/4K',
      'Tùy chỉnh watermark tên Shop và thương hiệu riêng',
      'Xuất chuẩn 1080p 60fps & 4K sắc nét nhất',
      'Ưu tiên hàng đợi BullMQ Redis Worker #1',
      'Chia sẻ Gmail chính thức điều hành bởi Admin thaytiensy@gmail.com',
      'Toàn bộ tính năng PRO đã được kích hoạt vĩnh viễn',
      'Hỗ trợ Gemini 3 Flash/Pro AI với Fallback 3 Model',
    ],
  },
  {
    id: 'plan-business',
    plan: 'BUSINESS',
    name: 'Gói Doanh Nghiệp (Enterprise VIP)',
    priceVND: 0,
    priceUSD: 0,
    videoLimitPerMonth: 9999,
    maxFacesPerVideo: 5,
    watermarkCustom: true,
    teamSeats: 999,
    features: [
      'Toàn bộ quyền lợi gói PRO',
      'Dedicated BullMQ worker cluster',
      'Chia sẻ Gmail không giới hạn thành viên',
      'Audit log xuất khẩu file compliance',
      'Đặc quyền Super Admin thaytiensy@gmail.com',
    ],
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorId: 'user-admin-tiensy',
    actorEmail: 'thaytiensy@gmail.com',
    action: 'BRANDING_UPDATE',
    meta: { appName: 'Art Video Maker PRO', version: '2.5.0-PRO-UNLIMITED' },
    createdAt: '2026-03-28T10:00:00.000Z',
  },
  {
    id: 'log-2',
    actorId: 'user-admin-tiensy',
    actorEmail: 'thaytiensy@gmail.com',
    action: 'PRICING_UPDATE',
    meta: { message: 'Nâng cấp toàn bộ hệ thống lên gói PRO Không Giới Hạn' },
    createdAt: '2026-03-29T11:20:00.000Z',
  },
];

export const INITIAL_LICENSES: AppLicense[] = [
  {
    id: 'lic-sy-001',
    licenseKey: 'SY-VIP9-9999',
    customerName: 'Thầy Tiến Sỹ (Super Admin)',
    customerContact: 'thaytiensy@gmail.com',
    plan: 'LIFETIME',
    status: 'ACTIVE',
    maxDevices: 5,
    expiresAt: 'NEVER',
    createdAt: '2026-01-01T00:00:00.000Z',
    notes: 'Key bản quyền vĩnh viễn'
  },
  {
    id: 'lic-sy-002',
    licenseKey: 'SY-PRO8-8888',
    customerName: 'Admin Quản Trị Hệ Thống',
    customerContact: 'admin',
    plan: 'LIFETIME',
    status: 'ACTIVE',
    maxDevices: 5,
    expiresAt: 'NEVER',
    createdAt: '2026-01-01T00:00:00.000Z',
    notes: 'Key bản quyền vĩnh viễn'
  },
  {
    id: 'lic-sy-003',
    licenseKey: 'SY-DEMO-30DY',
    customerName: 'Khách Hàng Dùng Thử 30 Ngày',
    customerContact: 'khachhang@gmail.com',
    plan: '1_MONTH',
    status: 'ACTIVE',
    maxDevices: 1,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    notes: 'Gói 1 tháng trải nghiệm'
  }
];

// Celebrity and Sensitive filters
export const CELEBRITY_BLOCKLIST = [
  'elon musk', 'donald trump', 'joe biden', 'taylor swift', 'cristiano ronaldo',
  'lionel messi', 'vladimir putin', 'kim jong un', 'sơn tùng m-tp', 'trấn thành',
  'hồ ngọc hà', 'mỹ tâm', 'biden', 'trump', 'putin'
];

export const SENSITIVE_KEYWORDS = [
  'nsfw', '18+', 'nude', 'khỏa thân', 'đồi trụy', 'chính trị', 'bạo lực', 
  'vũ khí', 'ma túy', 'cờ bạc', 'lừa đảo', 'deepfake lừa'
];

class DatabaseService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // Init default storage
  init() {
    this.getUsers(); // Ensures thaytiensy@gmail.com is present and PRO is applied
    if (!localStorage.getItem(STORAGE_KEYS.SHOPS)) {
      this.set(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
    }
    this.set(STORAGE_KEYS.TEMPLATES, []); // Remove all mock templates as requested
    this.set(STORAGE_KEYS.PRICING, INITIAL_PRICING);
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.set(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.set(STORAGE_KEYS.CURRENT_USER_ID, 'user-admin-tiensy');
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      this.set(STORAGE_KEYS.JOBS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVITES)) {
      this.set(STORAGE_KEYS.INVITES, []);
    }
  }

  // Users - all upgraded to PRO with thaytiensy@gmail.com guaranteed
  getUsers(): User[] {
    let users = this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    
    // Ensure admin thaytiensy@gmail.com is always present
    let admin = users.find((u) => u.email.toLowerCase() === 'thaytiensy@gmail.com');
    if (!admin) {
      admin = { ...INITIAL_USERS[0] };
      users.unshift(admin);
    } else {
      admin.role = 'ADMIN';
      admin.plan = 'PRO';
      admin.monthlyQuota = 9999;
      if (!admin.passwordHash) admin.passwordHash = '12345678';
    }

    // Upgrade all users to PRO with unlimited quota
    users.forEach((u) => {
      u.plan = 'PRO';
      u.monthlyQuota = 9999;
      if (!u.passwordHash) u.passwordHash = '12345678';
    });

    this.set(STORAGE_KEYS.USERS, users);
    return users;
  }

  getUser(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByPhone(phone: string): User | undefined {
    return this.getUsers().find((u) => u.phone === phone);
  }

  // Verify credentials for email, username or phone + password
  verifyCredentials(emailOrPhone: string, pass: string): { success: boolean; user?: User; error?: string } {
    const term = emailOrPhone.trim().toLowerCase();
    const user = this.getUsers().find(
      (u) => u.email.toLowerCase() === term || 
             u.phone === emailOrPhone.trim() ||
             (term === 'admin' && (u.email.toLowerCase() === 'admin' || u.role === 'ADMIN'))
    );
    if (!user) {
      return { success: false, error: 'Không tìm thấy tài khoản với tên đăng nhập hoặc email này.' };
    }
    if (user.isBanned) {
      return { success: false, error: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách.' };
    }
    const currentPass = user.passwordHash || (user.email === 'admin' ? '123456' : '12345678');
    if (pass !== currentPass) {
      return { success: false, error: 'Mật khẩu không chính xác. Mật khẩu mặc định là 123456 cho tài khoản admin.' };
    }
    return { success: true, user };
  }

  updateUser(id: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...updates };
    this.set(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'videosRenderedCount'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      plan: 'PRO', // All new users default to PRO
      monthlyQuota: 9999,
      passwordHash: user.passwordHash || '12345678',
      videosRenderedCount: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  getCurrentUserId(): string {
    return this.get(STORAGE_KEYS.CURRENT_USER_ID, 'user-admin-tiensy');
  }

  setCurrentUserId(id: string): void {
    this.set(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  // Shops
  getShops(): Shop[] {
    return this.get(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
  }

  getShop(id: string): Shop | undefined {
    return this.getShops().find((s) => s.id === id);
  }

  updateShop(id: string, updates: Partial<Shop>): Shop {
    const shops = this.getShops();
    const index = shops.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Shop not found');
    shops[index] = { ...shops[index], ...updates };
    this.set(STORAGE_KEYS.SHOPS, shops);
    return shops[index];
  }

  // Templates - cleaned of all mock templates
  getTemplates(industry?: Industry): Template[] {
    const templates: Template[] = this.get(STORAGE_KEYS.TEMPLATES, []);
    if (industry) {
      return templates.filter((t: Template) => t.industry === industry);
    }
    return templates;
  }

  // Authorized Gmail Accounts (Admin: thaytiensy@gmail.com adds users)
  addAuthorizedGmail(email: string, name?: string, role: User['role'] = 'EDITOR'): User {
    const normalized = email.trim().toLowerCase();
    const existing = this.getUserByEmail(normalized);
    if (existing) {
      return this.updateUser(existing.id, { role, plan: 'PRO', monthlyQuota: 9999 });
    }
    return this.createUser({
      email: normalized,
      phone: '0900000000',
      name: name || normalized.split('@')[0],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
      role,
      plan: 'PRO',
      shopId: 'shop-zen-1',
      passwordHash: '12345678',
      monthlyQuota: 9999,
    });
  }

  removeAuthorizedGmail(userId: string): void {
    let users = this.getUsers();
    users = users.filter((u) => u.id !== userId);
    this.set(STORAGE_KEYS.USERS, users);
  }

  getAuthorizedGmails(): User[] {
    return this.getUsers().filter((u) => u.email.toLowerCase() !== 'thaytiensy@gmail.com');
  }

  getTemplate(id: string): Template | undefined {
    return this.getTemplates().find((t) => t.id === id);
  }

  addTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'viewCount'>): Template {
    const templates = this.getTemplates();
    const newTpl: Template = {
      ...templateData,
      id: `tpl-${templateData.industry.toLowerCase()}-${Date.now()}`,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };
    templates.unshift(newTpl);
    this.set(STORAGE_KEYS.TEMPLATES, templates);
    this.logAudit({
      actorId: templateData.createdByAdminId,
      actorEmail: 'thaytiensy@gmail.com',
      action: 'TEMPLATE_UPLOAD',
      meta: { title: newTpl.title, industry: newTpl.industry, id: newTpl.id },
    });
    return newTpl;
  }

  updateTemplate(id: string, updates: Partial<Template>): Template {
    const templates = this.getTemplates();
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Template not found');
    templates[index] = { ...templates[index], ...updates };
    this.set(STORAGE_KEYS.TEMPLATES, templates);
    return templates[index];
  }

  deleteTemplate(id: string): void {
    const templates = this.getTemplates().filter((t) => t.id !== id);
    this.set(STORAGE_KEYS.TEMPLATES, templates);
  }

  // Video Jobs
  getJobs(userId?: string): VideoJob[] {
    const jobs = this.get<VideoJob[]>(STORAGE_KEYS.JOBS, []);
    if (userId) {
      return jobs.filter((j) => j.userId === userId);
    }
    return jobs;
  }

  getJob(id: string): VideoJob | undefined {
    return this.getJobs().find((j) => j.id === id);
  }

  createJob(jobData: Omit<VideoJob, 'id' | 'createdAt'>): VideoJob {
    const jobs = this.getJobs();
    const newJob: VideoJob = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    this.set(STORAGE_KEYS.JOBS, jobs);
    return newJob;
  }

  updateJob(id: string, updates: Partial<VideoJob>): VideoJob {
    const jobs = this.getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) throw new Error('Job not found');
    jobs[index] = { ...jobs[index], ...updates };
    this.set(STORAGE_KEYS.JOBS, jobs);
    return jobs[index];
  }

  deleteJob(id: string): void {
    const jobs = this.getJobs().filter((j) => j.id !== id);
    this.set(STORAGE_KEYS.JOBS, jobs);
  }

  // Team & Gmail Sharing
  getInvites(shopId?: string): ShareInvite[] {
    const invites = this.get<ShareInvite[]>(STORAGE_KEYS.INVITES, []);
    if (shopId) {
      return invites.filter((inv) => inv.shopId === shopId);
    }
    return invites;
  }

  createInvite(inviteData: Omit<ShareInvite, 'id' | 'createdAt' | 'status'>): ShareInvite {
    const invites = this.getInvites();
    const newInvite: ShareInvite = {
      ...inviteData,
      id: `inv-${Date.now()}`,
      status: 'ACCEPTED', // Automatically grant PRO workspace access via Gmail
      createdAt: new Date().toISOString(),
    };
    invites.unshift(newInvite);
    this.set(STORAGE_KEYS.INVITES, invites);

    // Also auto-add user to shop with PRO status
    let user = this.getUserByEmail(inviteData.invitedEmail);
    if (!user) {
      this.createUser({
        email: inviteData.invitedEmail,
        phone: '09' + Math.floor(10000000 + Math.random() * 90000000),
        name: inviteData.invitedEmail.split('@')[0].toUpperCase() + ' (PRO Member)',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        role: inviteData.role,
        plan: 'PRO',
        shopId: inviteData.shopId,
        passwordHash: '12345678',
        monthlyQuota: 9999,
      });
    }

    this.logAudit({
      actorId: inviteData.invitedByUserId,
      actorEmail: 'thaytiensy@gmail.com',
      action: 'GMAIL_SHARE',
      meta: { invitedEmail: inviteData.invitedEmail, role: inviteData.role },
    });

    return newInvite;
  }

  updateInviteStatus(id: string, status: ShareInvite['status']): void {
    const invites = this.getInvites();
    const idx = invites.findIndex((i) => i.id === id);
    if (idx !== -1) {
      invites[idx].status = status;
      this.set(STORAGE_KEYS.INVITES, invites);
    }
  }

  deleteInvite(id: string): void {
    const invites = this.getInvites().filter((i) => i.id !== id);
    this.set(STORAGE_KEYS.INVITES, invites);
  }

  // Pricing
  getPricing(): PricingConfig[] {
    return this.get(STORAGE_KEYS.PRICING, INITIAL_PRICING);
  }

  updatePricing(id: string, updates: Partial<PricingConfig>): PricingConfig {
    const list = this.getPricing();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Pricing not found');
    list[idx] = { ...list[idx], ...updates };
    this.set(STORAGE_KEYS.PRICING, list);
    return list[idx];
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.get(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // cap 100
    return newLog;
  }

  // Security Checks
  checkCelebrityBlocklist(name: string): { detected: boolean; name?: string } {
    if (!name) return { detected: false };
    const lower = name.toLowerCase().trim();
    for (const celeb of CELEBRITY_BLOCKLIST) {
      if (lower.includes(celeb)) {
        return { detected: true, name: celeb };
      }
    }
    return { detected: false };
  }

  checkSensitiveContent(text: string): { violation: boolean; keyword?: string } {
    if (!text) return { violation: false };
    const lower = text.toLowerCase();
    for (const kw of SENSITIVE_KEYWORDS) {
      if (lower.includes(kw)) {
        return { violation: true, keyword: kw };
      }
    }
    return { violation: false };
  }

  // Rate Limiting (PRO: generous 50 video/min)
  checkRateLimit(userId: string): { allowed: boolean; waitSeconds?: number } {
    const limits = this.get<Record<string, number[]>>(STORAGE_KEYS.RATE_LIMITS, {});
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const userTimestamps = (limits[userId] || []).filter((ts) => ts > oneMinuteAgo);
    
    // PRO plan allows 50 renders per minute
    if (userTimestamps.length >= 50) {
      const oldest = userTimestamps[0];
      const waitSeconds = Math.ceil((oldest + 60000 - now) / 1000);
      return { allowed: false, waitSeconds: Math.max(1, waitSeconds) };
    }

    userTimestamps.push(now);
    limits[userId] = userTimestamps;
    this.set(STORAGE_KEYS.RATE_LIMITS, limits);
    return { allowed: true };
  }

  // ==========================================================
  // MODULE BÁN APP & LICENSE (Định dạng: SY-XXXX-XXXX)
  // ==========================================================
  getLicenses(): AppLicense[] {
    return this.get(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
  }

  createLicense(data: { email_or_phone: string; plan?: AppLicense['plan']; duration_days?: number; notes?: string }): AppLicense {
    const list = this.getLicenses();
    const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `SY-${p1}-${p2}`;
    
    let expiresAt = 'NEVER';
    if (data.plan !== 'LIFETIME') {
      const days = data.duration_days || (data.plan === '1_YEAR' ? 365 : 30);
      expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    }

    const newLic: AppLicense = {
      id: `lic-${Date.now()}`,
      licenseKey: key,
      customerName: data.email_or_phone.split('@')[0],
      customerContact: data.email_or_phone.trim(),
      plan: data.plan || '1_MONTH',
      status: 'ACTIVE',
      maxDevices: 1,
      expiresAt,
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };
    list.unshift(newLic);
    this.set(STORAGE_KEYS.LICENSES, list);
    return newLic;
  }

  toggleLicense(keyOrId: string): AppLicense {
    const list = this.getLicenses();
    const clean = keyOrId.trim().toUpperCase();
    const idx = list.findIndex(l => l.id === keyOrId || l.licenseKey.toUpperCase() === clean);
    if (idx === -1) throw new Error('Không tìm thấy License Key');
    list[idx].status = list[idx].status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    this.set(STORAGE_KEYS.LICENSES, list);
    return list[idx];
  }

  revokeLicense(keyOrId: string): AppLicense {
    const list = this.getLicenses();
    const clean = keyOrId.trim().toUpperCase();
    const idx = list.findIndex(l => l.id === keyOrId || l.licenseKey.toUpperCase() === clean);
    if (idx === -1) throw new Error('Không tìm thấy License Key');
    list[idx].status = 'REVOKED';
    this.set(STORAGE_KEYS.LICENSES, list);
    return list[idx];
  }

  deleteLicense(keyOrId: string): void {
    const clean = keyOrId.trim().toUpperCase();
    const list = this.getLicenses().filter(l => l.id !== keyOrId && l.licenseKey.toUpperCase() !== clean);
    this.set(STORAGE_KEYS.LICENSES, list);
  }

  getActiveLicenseKey(): string {
    return this.get(STORAGE_KEYS.ACTIVE_LICENSE_KEY, 'SY-VIP9-9999');
  }

  setActiveLicenseKey(key: string): void {
    this.set(STORAGE_KEYS.ACTIVE_LICENSE_KEY, key.trim().toUpperCase());
  }

  checkAppLicense(): { isLicensed: boolean; plan?: string; expiresAt?: string; message?: string; key?: string } {
    const activeKey = this.getActiveLicenseKey();
    if (!activeKey) {
      return { isLicensed: false, message: 'Chưa kích hoạt bản quyền ứng dụng' };
    }
    const list = this.getLicenses();
    const lic = list.find(l => l.licenseKey.toUpperCase() === activeKey.toUpperCase());
    if (!lic) {
      return { isLicensed: false, message: 'Mã bản quyền không tồn tại' };
    }
    if (lic.status === 'REVOKED') {
      return { isLicensed: false, message: 'Bản quyền đã bị khóa hoặc thu hồi bởi Quản trị viên' };
    }
    if (lic.expiresAt !== 'NEVER') {
      const exp = new Date(lic.expiresAt).getTime();
      if (Date.now() > exp) {
        return { isLicensed: false, message: 'Bản quyền ứng dụng đã hết hạn sử dụng' };
      }
    }
    return { isLicensed: true, plan: lic.plan, expiresAt: lic.expiresAt, message: 'Bản quyền hợp lệ', key: lic.licenseKey };
  }

  activateLicense(key: string): { success: boolean; license?: AppLicense; error?: string } {
    const cleanKey = key.trim().toUpperCase();
    const list = this.getLicenses();
    const lic = list.find(l => l.licenseKey.toUpperCase() === cleanKey);
    if (!lic) {
      return { success: false, error: 'Mã License Key không tồn tại. Định dạng chuẩn: SY-XXXX-XXXX' };
    }
    if (lic.status === 'REVOKED') {
      return { success: false, error: 'License này đã bị thu hồi hoặc khóa bởi Quản trị viên.' };
    }
    if (lic.expiresAt !== 'NEVER') {
      const exp = new Date(lic.expiresAt).getTime();
      if (Date.now() > exp) {
        return { success: false, error: 'License này đã hết hạn sử dụng. Vui lòng liên hệ để gia hạn.' };
      }
    }
    this.setActiveLicenseKey(cleanKey);
    return { success: true, license: lic };
  }

  // ==========================================================
  // MODULE TÍCH HỢP AI CLOUD BYOK (Veo 3, D-ID, Grok)
  // ==========================================================
  getAICloudKeys(): { veoApiKey: string; didApiKey: string; grokApiKey: string } {
    return this.get(STORAGE_KEYS.AI_KEYS, {
      veoApiKey: '',
      didApiKey: '',
      grokApiKey: '',
    });
  }

  saveAICloudKeys(keys: { veoApiKey?: string; didApiKey?: string; grokApiKey?: string }): void {
    const current = this.getAICloudKeys();
    const updated = { ...current, ...keys };
    this.set(STORAGE_KEYS.AI_KEYS, updated);
  }

  hasCloudAI(type: 'veo' | 'did' | 'grok'): boolean {
    const keys = this.getAICloudKeys();
    if (type === 'veo') return Boolean(keys.veoApiKey && keys.veoApiKey.trim().length > 5);
    if (type === 'did') return Boolean(keys.didApiKey && keys.didApiKey.trim().length > 5);
    if (type === 'grok') return Boolean(keys.grokApiKey && keys.grokApiKey.trim().length > 5);
    return false;
  }
}

export const db = new DatabaseService();
db.init();
