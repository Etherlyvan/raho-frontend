// ─── API Response Wrappers ────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data:    T[];
  meta:    PaginationMeta;
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

// ─── Role ─────────────────────────────────────────────────────

export type RoleName =
  | "SUPER_ADMIN"
  | "MASTER_ADMIN"
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "PATIENT";

// ─── AppUser — tipe TUNGGAL yang disimpan di Zustand store ────
// Dinormalisasi dari LoginUser dan AuthUser

export interface AppUser {
  userId:    string;
  email:     string;
  role:      RoleName;
  branchId:  string | null;
  fullName:  string | null;
  avatarUrl: string | null;
  isActive:  boolean;
  profile?: {
    fullName:      string;
    phone:         string | null;
    avatarUrl:     string | null;
    jenisProfesi:  string | null;
    strNumber:     string | null;
    speciality:    string | null;
  } | null;
}

// ─── Auth ─────────────────────────────────────────────────────

export interface LoginPayload {
  email:    string;
  password: string;
}

// Response dari POST /auth/login (sesuai BE)
export interface LoginResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    string;
  user:         LoginUser;
}

// Shape user dari /auth/login
export interface LoginUser {
  userId:   string;
  email:    string;
  role:     RoleName;
  branchId: string | null;
  fullName: string | null;
  avatar:   string | null;   // BE pakai "avatar", bukan "avatarUrl"
}

// Response dari GET /auth/me (sesuai BE)
export interface MeResponse {
  userId:    string;
  email:     string;
  isActive:  boolean;
  createdAt: string;
  role: {
    name:        RoleName;
    permissions: string[];
  };
  branch: {
    branchId: string;
    name:     string;
    city:     string;
  } | null;
  profile: {
    fullName:      string;
    phone:         string | null;
    avatarUrl:     string | null;
    jenisProfesi:  string | null;
    strNumber:     string | null;
    speciality:    string | null;
  } | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}

// ─── Enums ────────────────────────────────────────────────────

export type MemberStatus        = "ACTIVE" | "INACTIVE" | "LEAD";
export type MemberPackageStatus = "PENDING_PAYMENT" | "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
export type EncounterStatus     = "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type SessionStatus       = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "POSTPONED";
export type InvoiceStatus       = "PENDING" | "PAID" | "REJECTED";
export type ProfesiType         = "DOKTER" | "NAKES";

export interface UserProfile {
  userProfileId:  string;
  userId:         string;
  fullName:       string;
  phone:          string | null;
  avatarUrl:      string | null;
  jenisProfesi:   ProfesiType | null;
  strNumber:      string | null;
  masaBerlakuStr: string | null;
  speciality:     string | null;
}

export interface UpdateProfilePayload {
  fullName:        string;
  phone?:          string;
  avatarUrl?:      string;
  jenisProfesi?:   ProfesiType;
  strNumber?:      string;
  masaBerlakuStr?: string;
  speciality?:     string;
}

// ─── Branch ───────────────────────────────────────────────────

export type BranchType = "KLINIK" | "HOMECARE";

export interface Branch {
  branchId:       string;
  branchCode:     string;
  name:           string;
  address:        string;
  city:           string;
  phone:          string | null;
  tipe:           BranchType;
  operatingHours: string | null;
  isActive:       boolean;
  createdAt:      string;
  _count: {
    users:             number;
    registeredMembers: number;
    encounters:        number;
    inventory:         number;
  };
}

export interface BranchStats {
  branch: {
    branchId: string;
    name:     string;
    city:     string;
    tipe:     BranchType;
  };
  stats: {
    totalActiveMembers:     number;
    activePackages:         number;
    todaySessions:          number;
    monthCompletedSessions: number;
    monthRevenue:           number;
    criticalStockCount:     number;
    activeStaff:            number;
  };
}

export interface CreateBranchPayload {
  name:            string;
  address:         string;
  city:            string;
  phone?:          string;
  tipe:            BranchType;
  operatingHours?: string;
}

export type UpdateBranchPayload = Partial<CreateBranchPayload>;

export interface BranchListParams {
  isActive?: boolean;
  tipe?:     BranchType;
  page?:     number;
  limit?:    number;
}

// ─── User / Staff ─────────────────────────────────────────────

export interface StaffUser {
  userId:    string;
  staffCode: string | null;
  email:     string;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    name:        RoleName;
    permissions: string[];
  };
  branch: {
    branchId: string;
    name:     string;
  } | null;
  profile: {
    fullName:       string;
    phone:          string | null;
    avatarUrl:      string | null;
    jenisProfesi:   ProfesiType | null;
    strNumber:      string | null;
    masaBerlakuStr: string | null;
    speciality:     string | null;
  } | null;
}

export interface CreateUserPayload {
  email:          string;
  password:       string;
  role:           RoleName;
  branchId?:      string;
  fullName:       string;
  phone?:         string;
  jenisProfesi?:  ProfesiType;
  strNumber?:     string;
  speciality?:    string;
}

export interface UpdateUserPayload {
  fullName?:      string;
  phone?:         string;
  jenisProfesi?:  ProfesiType;
  strNumber?:     string;
  masaBerlakuStr?: string;
  speciality?:    string;
  branchId?:      string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface UserListParams {
  role?:     RoleName;
  branchId?: string;
  isActive?: boolean;
  page?:     number;
  limit?:    number;
}


