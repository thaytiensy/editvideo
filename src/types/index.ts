export type UserRole = 'ADMIN' | 'SHOP_OWNER' | 'EDITOR' | 'VIEWER';
export type UserPlan = 'FREE' | 'PRO' | 'BUSINESS';
export type Industry = 'NOITHAT' | 'THOITRANG' | 'MYPHAM' | 'GIADUNG';
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type AuditAction = 
  | 'FACE_SWAP' 
  | 'TEMPLATE_UPLOAD' 
  | 'USER_BAN' 
  | 'SECURITY_BLOCK' 
  | 'PRICING_UPDATE' 
  | 'BRANDING_UPDATE' 
  | 'GMAIL_SHARE';

export type GeminiModelId = 'gemini-3-flash-preview' | 'gemini-3-pro-preview' | 'gemini-2.5-flash';

export interface GeminiModelOption {
  id: GeminiModelId;
  name: string;
  tag: string;
  badge?: string;
  description: string;
  isDefault?: boolean;
  recommended?: boolean;
}

export interface GmailSharePayload {
  toEmail: string;
  subject: string;
  body: string;
  senderEmail: string;
}

export interface FaceItem {
  id: string;
  name: string;
  imageUrl: string;
  livenessVideoUrl?: string;
  livenessPassed: boolean;
  livenessMotionScore?: number; // 0 to 100
  consentTick: boolean;
  detectedCelebrity?: string | null;
  estimatedAge?: number;
  swapConfig?: FaceSwapConfig;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatarUrl: string;
  passwordHash?: string;
  role: UserRole;
  plan: UserPlan;
  shopId: string;
  isBanned?: boolean;
  videosRenderedCount: number;
  monthlyQuota: number;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  watermarkText: string;
  ownerId: string;
}

export interface Template {
  id: string;
  industry: Industry;
  title: string;
  videoUrl: string;
  thumbUrl: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  durationSeconds: number;
  maxFaces: number;
  isActive: boolean;
  createdByAdminId: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
}

export interface FaceSwapConfig {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale: number; // scale factor 0.3 - 2.5
  rotation?: number; // degrees
  feather: number; // feather border blur px
  opacity: number; // 0.1 - 1.0
}

export type ImageToVideoMotion = 'KEN_BURNS' | 'BREATHING_PULSE' | 'PARALLAX_ZOOM' | 'CAMERA_PAN';

export interface VideoJob {
  id: string;
  userId: string;
  userEmail: string;
  shopId: string;
  jobType?: 'VIDEO_FACE_SWAP' | 'IMAGE_TO_VIDEO_SWAP';
  motionStyle?: ImageToVideoMotion;
  sourceImageUrl?: string;
  templateId?: string;
  templateTitle: string;
  templateThumbUrl?: string;
  videoSourceUrl?: string;
  videoFileName?: string;
  industry?: Industry;
  faces: FaceItem[];
  status: JobStatus;
  progress: number;
  stageMessage: string;
  engineUsed: string;
  outputUrl?: string;
  durationSeconds: number;
  appliedWatermark?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface ShareInvite {
  id: string;
  shopId: string;
  shopName: string;
  invitedEmail: string;
  invitedByUserId: string;
  role: 'EDITOR' | 'VIEWER';
  status: InviteStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  targetUserId?: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface PricingConfig {
  id: string;
  plan: UserPlan;
  name: string;
  priceVND: number;
  priceUSD: number;
  videoLimitPerMonth: number;
  maxFacesPerVideo: number;
  watermarkCustom: boolean;
  teamSeats: number;
  features: string[];
  recommended?: boolean;
}
