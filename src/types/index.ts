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
export type MemberPackageStatus   = "PENDING_PAYMENT" | "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
export type EncounterStatus     = "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type SessionStatus         = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "POSTPONED";
export type InvoiceStatus         = "PENDING" | "PAID" | "OVERDUE" | "REJECTED";
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

// ─── Dashboard Admin ──────────────────────────────────────────

export interface TodaySessionItem {
  treatmentSessionId: string;
  treatmentDate: string;
  status: SessionStatus;
  infusKe: number | null;
  pelaksanaan: string | null;
  encounter: {
    member: { fullName: string; memberNo: string };
    branch: { name: string };
  };
  nurse: { profile: { fullName: string } | null } | null;
}

export interface AdminDashboard {
  summary: {
    todaySessions: number;
    pendingInvoices: number;
    pendingStockRequests: number;
    totalActiveMembers: number;
    criticalStockCount: number;
    monthRevenue: { total: number; invoiceCount: number };
  };
  todaySchedule: TodaySessionItem[];
  revenueChart: { date: string; total: number }[];
}
// ─── Member (Pasien) ──────────────────────────────────────────

export type JenisKelamin = "L" | "P"; 
export type BloodType    = "A" | "B" | "AB" | "O" | "UNKNOWN";

export interface Member {
  memberId:          string;
  memberNo:          string;
  // ── flat fields (tidak ada lagi nested profile) ──────────────────
  fullName:          string;
  phone:             string | null;
  email:             string | null;
  nik:               string | null;
  dateOfBirth:       string | null;   // ISO DateTime string, bukan birthDate
  tempatLahir:       string | null;   // bukan birthPlace
  jenisKelamin:      JenisKelamin | null; // "L" | "P", bukan LAKILAKI/PEREMPUAN
  address:           string | null;
  pekerjaan:         string | null;   // bukan occupation
  statusNikah:       string | null;
  emergencyContact:  string | null;   // single field, bukan 3 field terpisah
  medicalHistory:    Record<string, unknown> | null; // JSON, bukan string
  sumberInfoRaho:    string | null;
  // ── status & flags ───────────────────────────────────────────────
  status:            MemberStatus;
  isConsentToPhoto:  boolean;
  createdAt:         string;
  updatedAt:         string;
  // ── relasi ───────────────────────────────────────────────────────
  registrationBranch: { branchId: string; name: string; city: string }; // bukan branch
  user?:             { userId: string; isActive: boolean };
  _count?:           { packages: number; encounters: number; documents: number };
}

export interface MemberLookupResult {
  memberId:           string;
  memberNo:           string;
  fullName:           string;
  phone:              string | null;
  status:             MemberStatus;
  registrationBranch: { branchId: string; name: string; city: string }; // bukan branchName
}

export interface CreateMemberPayload {
  fullName:        string;
  phone?:          string;
  email?:          string;
  nik?:            string;
  dateOfBirth?:    string;      // bukan birthDate
  tempatLahir?:    string;      // bukan birthPlace
  jenisKelamin?:   JenisKelamin; // bukan gender
  address?:        string;
  pekerjaan?:      string;      // bukan occupation
  statusNikah?:    string;
  emergencyContact?: string;    // bukan emergencyName/Phone/Relation
  medicalHistory?: string;
  sumberInfoRaho?: string;
}
export type UpdateMemberPayload = Partial<CreateMemberPayload>;
export interface MemberListParams {
  status?:   MemberStatus;
  search?:   string;
  page?:     number;
  limit?:    number;
}

// ─── Member Package ───────────────────────────────────────────

export type PackageType          = "BASIC" | "BOOSTER";


export interface MemberPackage {
  memberPackageId: string;
  type:           PackageType;
  packageName?: string | null
  status:         MemberPackageStatus;
  totalSessions:  number;
  usedSessions:   number;
  startDate:      string | null;
  endDate:        string | null;
  paidAt:         string | null;
  notes:          string | null;
  createdAt:      string;
  branch: {
    branchId: string;
    name:     string;
  };
  member?: {
    memberId:  string;
    memberNo:  string;
    fullName:  string;
  };
}

export interface AssignPackagePayload {
  type:       PackageType;
  startDate?: string;
  notes?:     string;
}

export interface ConfirmPackagePaymentPayload {
  paidAt: string;
  notes?: string;
}

// ─── Member Document ──────────────────────────────────────────

export type DocumentType =
  | "IDENTITAS"
  | "FOTO_PASIEN"
  | "KARTU_ASURANSI"
  | "RESEP_DOKTER"
  | "HASIL_LAB"
  | "LAINNYA";

export interface MemberDocument {
  documentId:  string;
  type:        DocumentType;
  url:         string;
  filename:    string | null;
  createdAt:   string;
}

// ─── Branch Access ────────────────────────────────────────────

export interface BranchAccess {
  accessId:  string;
  grantedAt: string;
  branch: {
    branchId: string;
    name:     string;
    city:     string;
  };
  grantedBy?: {
    fullName: string;
  };
}

export interface GrantBranchAccessPayload {
  memberNo: string;   // kode akun pasien
}

// ─── EMR ──────────────────────────────────────────────────────

export interface EMREntry {
  encounterId: string;
  type:        string;
  encounterDate: string;
  doctor: {
    fullName: string;
  };
  diagnosis: string | null;
  sessions: {
    sessionId:   string;
    sessionDate: string;
    status:      string;
    notes:       string | null;
  }[];
  emrNotes: {
    noteId:    string;
    type:      string;
    content:   string;
    createdAt: string;
  }[];
}

// ─── ENCOUNTER ───────────────────────────────────────────────────────────────

export type EncounterType = 'CONSULTATION' | 'TREATMENT'
export type PelaksanaanType = 'KLINIK' | 'HOMECARE'

export interface AssessmentData {
  eligibility: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'CONDITIONAL'
  targetOutcome?: string
  notes?: string
}

export interface TreatmentPlanData {
  protocol: string
  frequency?: string
  totalSessions?: number
  duration?: string
  specialNotes?: string
}

/** Ref paket yang disematkan di dalam Encounter (field dari encounterSelect BE) */
export interface EncounterPackageRef {
  memberPackageId: string
  packageType: PackageType          // ← 'packageType', BUKAN 'type'
  packageName: string | null
  status: MemberPackageStatus
  usedSessions: number
  totalSessions: number
}

export interface Encounter {
  encounterId: string
  type: EncounterType
  status: EncounterStatus
  treatmentDate: string | null
  completedAt: string | null
  assessment: AssessmentData | null
  treatmentPlan: TreatmentPlanData | null
  consultationEncounterId: string | null
  createdAt: string
  updatedAt: string
  member: {
    memberId: string
    memberNo: string
    fullName: string              // flat, BUKAN member.profile.fullName
    status: MemberStatus
  }
  doctor: {
    userId: string
    staffCode: string | null
    profile: { fullName: string; speciality: string | null } | null
  }
  branch: {
    branchId: string
    name: string
    city: string
    tipe: BranchType
  }
  memberPackage: EncounterPackageRef
  _count: {
    sessions: number
    diagnoses: number
    emrNotes: number
  }
}

export interface CreateEncounterPayload {
  memberId: string
  doctorId: string
  branchId: string
  memberPackageId: string
  type: EncounterType
  consultationEncounterId?: string
  treatmentDate?: string            // ISO 8601
}

export interface UpdateEncounterStatusPayload {
  status: EncounterStatus
}

export interface EncounterListParams {
  memberId?: string
  branchId?: string
  type?: EncounterType
  status?: EncounterStatus
  page?: number
  limit?: number
}

// ─── THERAPY PLAN ─────────────────────────────────────────────────────────────

export interface TherapyPlan {
  sessionTherapyPlanId: string
  treatmentSessionId: string
  ifaMg: number | null
  hhoMl: number
  h2Ml: number | null
  noMl: number | null
  gasoMl: number | null
  o2Ml: number | null
  notes: string | null
  plannedAt: string
  createdAt: string
  updatedAt: string
  planner: {
    userId: string
    staffCode: string | null
    profile: { fullName: string } | null
  }
}

// ─── TREATMENT SESSION ────────────────────────────────────────────────────────

/** Ref paket yang disematkan di dalam TreatmentSession (sessionListSelect BE) */
export interface SessionPackageRef {
  memberPackageId: string
  packageType: PackageType
  packageName: string | null
  usedSessions: number
  totalSessions: number
}

export interface TreatmentSession {
  treatmentSessionId: string
  encounterId: string
  pelaksanaan: PelaksanaanType | null
  infusKe: number | null
  boosterPackageId: string | null
  treatmentDate: string
  nextTreatmentDate: string | null
  startedAt: string | null
  completedAt: string | null
  status: SessionStatus
  keluhanSebelum: string | null
  keluhanSesudah: string | null
  berhasilInfus: boolean | null
  healingCrisis: string | null
  createdAt: string
  updatedAt: string
  encounter: {
    type: EncounterType
    status: EncounterStatus
    consultationEncounterId: string | null
    member: { memberId: string; memberNo: string; fullName: string; isConsentToPhoto: boolean; }
    branch: { branchId: string; name: string; city: string; tipe: BranchType }
    memberPackage: SessionPackageRef
  }
  nurse: {
    userId: string
    staffCode: string | null
    profile: { fullName: string } | null
  } | null
  boosterPackage: SessionPackageRef | null
  _count: {
    vitalSigns: number
    materialUsages: number
    photos: number
    emrNotes: number
  }
    invoice?: {
    invoiceId: string
    amount: number
    status: InvoiceStatus
    paidAt: string | null
  } | null
}

export interface TreatmentSessionDetail extends TreatmentSession {
  therapyPlan: TherapyPlan | null
  infusionExecution: {
    infusionExecutionId: string
    ifaMgActual: number | null
    hhoMlActual: number | null
    h2MlActual: number | null
    noMlActual: number | null
    gasoMlActual: number | null
    o2MlActual: number | null
    tglProduksiCairan: string | null
    jenisBotol: string | null
    jenisCairan: string | null
    volumeCarrierMl: number | null
    jumlahPenggunaanJarum: number | null
    deviationNote: string | null
    filledAt: string
    filler: {
      userId: string
      staffCode: string | null
      profile: { fullName: string } | null
    }
  } | null
  evaluation: {
    doctorEvaluationId: string
    kondisiPasien: string | null
    progress: string | null
    rekomendasiSesi: string | null
    perubahanPlan: Record<string, unknown> | null
    notes: string | null
    createdAt: string
    doctor: {
      userId: string
      staffCode: string | null
      profile: { fullName: string } | null
    }
  } | null
  vitalSigns: {
    sessionVitalSignId: string
    measuredAt: string | null
    nadi: number | null
    pi: string | null
    tensiSistolik: number | null
    tensiDiastolik: number | null
  }[]
  materialUsages: {
    materialUsageId: string
    quantity: number
    unit: string
    createdAt: string
    item: { inventoryItemId: string; name: string; category: string }
    inputByUser: { userId: string; profile: { fullName: string } | null }
  }[]
  photos: {
    sessionPhotoId: string
    photoUrl: string
    fileName: string
    caption: string | null
    takenAt: string | null
    takenByUser: { userId: string; profile: { fullName: string } | null }
  }[]
  emrNotes: {
    emrNoteId: string
    type: string
    authorRole: string
    content: Record<string, unknown>
    createdAt: string
    author: { userId: string; profile: { fullName: string } | null }
  }[]
  invoice: {
    invoiceId: string
    amount: number
    status: InvoiceStatus
    paidAt: string | null
  } | null
}

export interface InvoiceItem {
  name: string
  quantity: number
  price: number
}

export interface CreateSessionPayload {
  encounterId: string
  nurseId?: string
  pelaksanaan?: PelaksanaanType
  boosterPackageId?: string
  treatmentDate: string             // ISO 8601
  nextTreatmentDate?: string
  keluhanSebelum?: string
}

export interface CompleteSessionPayload {
  keluhanSesudah?: string
  berhasilInfus?: boolean
  healingCrisis?: string
  invoiceAmount: number
  invoiceItems: InvoiceItem[]
  invoiceNotes?: string
  nextTreatmentDate?: string
}

export interface PostponeSessionPayload {
  reason: string
  newTreatmentDate?: string
}

export interface UpdateSessionPayload {
  nurseId?: string
  pelaksanaan?: PelaksanaanType
  keluhanSebelum?: string
  keluhanSesudah?: string
  berhasilInfus?: boolean
  healingCrisis?: string
  nextTreatmentDate?: string
}

export interface SessionListParams {
  page?: number
  limit?: number
  encounterId?: string
  status?: SessionStatus
  branchId?: string
  nurseId?: string
  dateFrom?: string   // ← TAMBAH
  dateTo?: string     // ← TAMBAH
}

// ─── INVOICE ──────────────────────────────────────────────────────────────────

export interface Invoice {
  invoiceId: string
  amount: number
  status: InvoiceStatus
  items: InvoiceItem[]
  notes: string | null
  paidAt: string | null
  verifiedBy: string | null
  createdAt: string
  updatedAt: string
  member: {
    memberId: string
    memberNo: string
    fullName: string
    phone: string | null
  }
  session: {
    treatmentSessionId: string
    infusKe: number | null
    treatmentDate: string
    completedAt: string | null
    pelaksanaan: PelaksanaanType | null
    encounter: {
      encounterId: string
      type: EncounterType
      branch: { branchId: string; name: string; city: string }
      memberPackage: { packageType: PackageType; packageName: string | null }
    }
  }
  verifiedByUser: {
    userId: string
    staffCode: string | null
    profile: { fullName: string } | null
  } | null
}

export interface PayInvoicePayload {
  paidAt?: string
  notes?: string
}

export interface RejectInvoicePayload {
  reason: string
}

export interface InvoiceListParams {
  status?: InvoiceStatus
  memberId?: string
  branchId?: string
  dateFrom?: string                 // ISO 8601
  dateTo?: string
  page?: number
  limit?: number
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type InventoryCategory = 'MEDICINE' | 'DEVICE' | 'CONSUMABLE'

export interface InventoryItem {
  inventoryItemId: string
  name: string
  category: InventoryCategory
  unit: string
  stock: number
  minThreshold: number
  location: string | null
  isActive: boolean
  partnershipId: string | null
  createdAt: string
  updatedAt: string
  branch: {
    branchId: string
    name: string
    city: string
    tipe: BranchType
  }
  partnership: {
    partnershipId: string
    name: string
    city: string
  } | null
  _count: {
    usages: number
    requests: number
  }
}

// Shape khusus dari GET /inventory/alerts (raw SQL — berbeda dari inventorySelect)
export interface InventoryAlert {
  inventoryItemId: string
  name: string
  category: InventoryCategory
  unit: string
  stock: number
  minThreshold: number
  location: string | null
  branchId: string
}

export interface AlertsResponse {
  total: number
  items: InventoryAlert[]
}

export interface CreateInventoryPayload {
  name: string
  category: InventoryCategory
  unit: string
  stock?: number
  minThreshold?: number
  location?: string
  partnershipId?: string
}

export type UpdateInventoryPayload = Partial<
  Omit<CreateInventoryPayload, 'stock'>
>

export interface AddStockPayload {
  amount: number   // ← wajib "amount" sesuai addStockSchema BE
  notes?: string
}

export interface InventoryListParams {
  category?: InventoryCategory
  isActive?: boolean
  search?: string
  branchId?: string
  belowThreshold?: boolean
  page?: number
  limit?: number
}

// ─── Stock Request ────────────────────────────────────────────────────────────

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED'

export interface StockRequest {
  stockRequestId: string
  quantity: number
  reason: string | null
  status: RequestStatus
  createdAt: string
  item: {
    inventoryItemId: string
    name: string
    category: InventoryCategory
    unit: string
    stock: number
    minThreshold: number
    branch: {
      branchId: string
      name: string
      city: string
    }
  }
  requester: {
    userId: string
    staffCode: string | null
    role: { name: RoleName }
    profile: { fullName: string } | null
  }
}

export interface CreateStockRequestPayload {
  inventoryItemId: string
  quantity: number
  reason?: string
}

export interface StockRequestListParams {
  inventoryItemId?: string
  status?: RequestStatus
  branchId?: string
  page?: number
  limit?: number
}

export interface RejectStockRequestPayload {
  reason: string
}

export interface FulfillStockRequestPayload {
  actualQuantity?: number
  notes?: string
}

// ─────────────────────────────────────────────
// DIAGNOSIS
// ─────────────────────────────────────────────
export type ICDClassification = "primer" | "sekunder" | "tersier";

export interface Diagnosis {
  diagnosisId: string;
  encounterId: string;
  icdCode: string;
  icdDescription: string;
  classification: ICDClassification;
  anamnesis: string | null;
  physicalExam: string | null;
  supportingExam: string | null;
  differentialDiagnosis: string | null;
  workingDiagnosis: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    userId: string;
    profile: { fullName: string | null };
  };
}

export interface CreateDiagnosisPayload {
  icdCode: string;
  icdDescription: string;
  classification: ICDClassification;
  anamnesis?: string;
  physicalExam?: string;
  supportingExam?: string;
  differentialDiagnosis?: string;
  workingDiagnosis?: string;
}

export type UpdateDiagnosisPayload = Partial<CreateDiagnosisPayload>;

// ─────────────────────────────────────────────
// THERAPY PLAN
// ─────────────────────────────────────────────
export interface CreateTherapyPlanPayload {
  ifaMg?: number | null;
  hhoMl: number;
  h2Ml?: number | null;
  noMl?: number | null;
  gasoMl?: number | null;
  o2Ml?: number | null;
  notes?: string;
}

export type UpdateTherapyPlanPayload = Partial<CreateTherapyPlanPayload>;

// ─────────────────────────────────────────────
// EVALUATION
// ─────────────────────────────────────────────
export type EvaluationProgress = "IMPROVING" | "STABLE" | "DECLINING";

export interface PlanChange {
  field: string;
  from: string;
  to: string;
  reason: string;
}

export interface SessionEvaluation {
  evaluationId: string;
  treatmentSessionId: string;
  condition: string | null;
  progress: EvaluationProgress | null;
  recommendation: string | null;
  planChanges: PlanChange[];
  createdAt: string;
  updatedAt: string;
  doctor: {
    userId: string;
    profile: { fullName: string | null };
  };
}

export interface CreateEvaluationPayload {
  condition?: string;
  progress?: EvaluationProgress;
  recommendation?: string;
  planChanges?: PlanChange[];
}

export type UpdateEvaluationPayload = Partial<CreateEvaluationPayload>;

// ─────────────────────────────────────────────
// EMR NOTES
// ─────────────────────────────────────────────
export type EMRNoteType =
  | "ASSESSMENT"
  | "CLINICAL_NOTE"
  | "OPERATIONAL_NOTE"
  | "FOLLOW_UP";

export interface EMRNote {
  noteId: string;
  type: EMRNoteType;
  content: string;
  createdAt: string;
  author: {
    userId: string;
    role: { name: RoleName };
    profile: { fullName: string | null };
  };
}

export interface CreateEMRNotePayload {
  type: EMRNoteType;
  content: string;
}

// ─────────────────────────────────────────────
// DOCTOR DASHBOARD
// ─────────────────────────────────────────────
export interface DoctorScheduleItem {
  treatmentSessionId: string;
  treatmentDate: string;
  status: SessionStatus;
  infusKe: number | null;
  member: {
    memberId: string;
    memberNo: string;
    fullName: string;
  };
  branch: { name: string };
}

export interface DoctorDashboard {
  summary: {
    todaySessions: number;
    activeEncounters: number;
    pendingAssessments: number;
    evaluationRate: number; // persen
  };
  todaySchedule: DoctorScheduleItem[];
}

// ─────────────────────────────────────────────
// ASSESSMENT (untuk PUT /encounters/:id/assessment)
// ─────────────────────────────────────────────
export type EligibilityStatus = "ELIGIBLE" | "NOT_ELIGIBLE" | "CONDITIONAL";

export interface UpsertAssessmentPayload {
  eligibility: EligibilityStatus;
  targetOutcome?: string;
  notes?: string;
  treatmentPlan?: {
    protocol: string;
    frequency?: string;
    totalSessions?: number;
    duration?: string;
    specialNotes?: string;
  };
}

// ─── SPRINT 7: NURSE MODULE ───────────────────────────────────────────────────

// --- Tanda Vital ---
export interface VitalSign {
  sessionVitalSignId: string;
  treatmentSessionId: string;
  measuredAt: string | null;
  nadi: number | null;
  pi: string | null; // Decimal(5,2) diserialisasi sebagai string
  tensiSistolik: number | null;
  tensiDiastolik: number | null;
}

export interface CreateVitalSignPayload {
  nadi?: number;
  pi?: number;
  tensiSistolik?: number;
  tensiDiastolik?: number;
  measuredAt?: string; // ISO 8601
}

// --- Pelaksanaan Infus Aktual ---
export type JenisBotol = 'IFA' | 'EDTA';

export interface InfusionExecution {
  infusionExecutionId: string;
  treatmentSessionId: string;
  ifaMgActual: number | null;
  hhoMlActual: number | null;
  h2MlActual: number | null;
  noMlActual: number | null;
  gasoMlActual: number | null;
  o2MlActual: number | null;
  tglProduksiCairan: string | null;
  jenisBotol: JenisBotol | null;
  jenisCairan: string | null;
  volumeCarrierMl: number | null;
  jumlahPenggunaanJarum: number | null;
  deviationNote: string | null;
  filledAt: string;
  createdAt: string;
  updatedAt: string;
  filler: {
    userId: string;
    staffCode: string | null;
    profile: { fullName: string } | null;
  };
  /** Disertakan oleh BE untuk perbandingan plan vs aktual */
  session: {
    status: SessionStatus;
    infusKe: number | null;
    therapyPlan: {
      ifaMg: number | null;
      hhoMl: number;
      h2Ml: number | null;
      noMl: number | null;
      gasoMl: number | null;
      o2Ml: number | null;
    } | null;
  };
}

export interface CreateInfusionPayload {
  ifaMgActual?: number;
  hhoMlActual?: number;
  h2MlActual?: number;
  noMlActual?: number;
  gasoMlActual?: number;
  o2MlActual?: number;
  tglProduksiCairan?: string;  // ISO 8601
  jenisBotol?: JenisBotol;
  jenisCairan?: string;
  volumeCarrierMl?: number;
  jumlahPenggunaanJarum?: number;
  deviationNote?: string;
}

export type UpdateInfusionPayload = Partial<CreateInfusionPayload>;

// --- Pemakaian Material ---
export interface MaterialUsage {
  materialUsageId: string;
  treatmentSessionId: string;
  quantity: number;
  unit: string;
  createdAt: string;
  item: {
    inventoryItemId: string;
    name: string;
    category: InventoryCategory;
    unit: string;
    stock: number;
  };
  inputByUser: {
    userId: string;
    staffCode: string | null;
    profile: { fullName: string } | null;
  };
}

export interface CreateMaterialUsagePayload {
  inventoryItemId: string;
  quantity: number;
  unit: string;
}

// --- Foto Sesi ---
export interface SessionPhoto {
  sessionPhotoId: string;
  treatmentSessionId: string;
  memberId: string;
  photoUrl: string;
  fileName: string;
  fileSizeBytes: number | null;
  caption: string | null;
  takenAt: string | null;
  createdAt: string;
  takenByUser: {
    userId: string;
    staffCode: string | null;
    profile: { fullName: string } | null;
  };
}

export interface CreateSessionPhotoPayload {
  photoUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  caption?: string;
  takenAt?: string; // ISO 8601
}

// --- Nurse Dashboard ---
export interface NurseScheduleItem {
  treatmentSessionId: string;
  treatmentDate: string;
  status: SessionStatus;
  infusKe: number | null;
  startedAt: string | null;
  encounter: {
    member: { fullName: string; memberNo: string };
    branch: { name: string };
  };
}

export interface NurseDashboard {
  summary: {
    todaySessions: number;
    inProgressSessions: number;
    criticalStockCount: number;
    pendingStockRequests: number;
  };
  todaySchedule: NurseScheduleItem[];
}
