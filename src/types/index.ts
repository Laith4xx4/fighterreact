// ============================================
// Enums
// ============================================
export enum BookingStatus {
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled'
}

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent'
}

export enum SessionStatus {
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// Backward compatibility aliases
export type BookingDto = BookingResponseDto;
export type SessionDto = SessionResponseDto;
export type ReviewDto = FeedbackResponseDto; // Assuming ReviewDto mapped to FeedbackResponseDto

// ============================================
// User and Auth Types
// ============================================
export interface LoginDto {
  userNameOrEmail: string;  // Can be either username or email
  password: string;
}

export interface RegisterDto {
  userName: string;
  role?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface UserDto {
  id: string;
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  role: 'Admin' | 'Coach' | 'Member';
}

export interface AuthResponse {
  token: string;
  user?: UserDto;
  message?: string;
}

// ============================================
// Coach Types
// ============================================
export interface CreateCoachProfileDto {
  userName: string;
  bio?: string;
  specialization?: string;
  certifications?: string;
}

export interface UpdateCoachProfileDto {
  bio?: string;
  specialization?: string;
  certifications?: string;
}

export interface CoachProfileResponseDto {
  id: number;
  userName: string;
  bio: string;
  specialization: string;
  certifications?: string;
  sessionsCount: number;
  feedbacksCount: number;
}

// ============================================
// Session Types
// ============================================
export interface CreateSessionDto {
  coachId: number;
  classTypeId: number;
  startTime: string;
  endTime: string;
  capacity: number;
  description?: string;
  sessionName: string;
}

export interface UpdateSessionDto {
  startTime?: string;
  endTime?: string;
  capacity?: number;
  description?: string;
  sessionName?: string;
}

export interface SessionResponseDto {
  id: number;
  coachId: number;
  coachName: string;
  classTypeId: number;
  classTypeName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  description?: string;
  sessionName: string;
  bookingsCount: number;
  attendanceCount: number;
  bookings: BookingResponseDto[];
}

// ============================================
// ClassType Types
// ============================================
export interface CreateClassTypeDto {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface UpdateClassTypeDto {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface ClassTypeResponseDto {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  sessionsCount: number;
}

// ============================================
// Booking Types
// ============================================
export interface CreateBookingDto {
  sessionId: number;
  memberId: number;
  bookingTime: string;
  status: BookingStatus;
}

export interface BookSessionDto {
  sessionId: number;
}

export interface UpdateBookingDto {
  status: BookingStatus;
}

export interface BookingResponseDto {
  id: number;
  sessionId: number;
  sessionName: string;
  memberId: number;
  memberName: string;
  bookingTime: string;
  status: BookingStatus;
}

// ============================================
// MemberProfile Types
// ============================================
export interface CreateMemberProfileDto {
  userName: string;
  firstName?: string;
  lastName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
  joinDate: string;
}

export interface UpdateMemberProfileDto {
  firstName?: string;
  lastName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
}

export interface MemberProfileResponseDto {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
  joinDate: string;
  bookingsCount: number;
  attendanceCount: number;
  feedbacksGivenCount: number;
  progressRecordsCount: number;
}

// ============================================
// Feedback Types
// ============================================
export interface CreateFeedbackDto {
  memberId: number;
  coachId: number;
  sessionId: number;
  rating: number;
  comments?: string;
  timestamp?: string;
  senderType?: string;
}

export interface UpdateFeedbackDto {
  rating?: number;
  comments?: string;
}

export interface FeedbackResponseDto {
  id: number;
  memberId: number;
  memberName: string;
  coachId: number;
  coachName: string;
  sessionId: number;
  sessionName: string;
  rating: number;
  comments?: string;
  timestamp: string;
  senderType: string;
}

// ============================================
// Attendance Types
// ============================================
export interface CreateAttendanceDto {
  sessionId: number;
  memberId: number;
  status: AttendanceStatus;
}

export interface UpdateAttendanceDto {
  status: AttendanceStatus;
}

export interface AttendanceResponseDto {
  id: number;
  sessionId: number;
  sessionName: string;
  memberId: number;
  memberName: string;
  status: AttendanceStatus;
}

// ============================================
// MemberSetProgress Types
// ============================================
export interface CreateMemberSetProgressDto {
  memberId: number;
  date: string;
  setsCompleted: number;
  promotionDate?: string;
}

export interface UpdateMemberSetProgressDto {
  setsCompleted?: number;
  promotionDate?: string;
}

export interface MemberSetProgressResponseDto {
  id: number;
  memberId: number;
  memberName: string;
  date: string;
  setsCompleted: number;
  promotionDate?: string;
}

// ============================================
// Dashboard Stats (kept for compatibility)
// ============================================
export interface AdminDashboardStats {
  totalMembers: number;
  totalCoaches: number;
  totalSessions: number;
  totalBookings: number;
  activeMembers: number;
  upcomingSessions: number;
  todaySessions: number;
  monthlyRevenue?: number;
}

export interface CoachDashboardStats {
  totalSessions: number;
  upcomingSessions: number;
  totalStudents: number;
  averageRating: number;
  todaySessions: SessionResponseDto[];
}

export interface MemberDashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  attendedSessions: number;
  currentStreak: number;
  upcomingBookingsList: BookingResponseDto[];
}

// ============================================
// API Response wrapper
// ============================================
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
