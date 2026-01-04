import * as Types from "@/types";

// Configure your .NET backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://thesavage.runasp.net/api";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("authToken");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = "/login";
      }
      
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || error.Message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ============================================
// Auth API
// ============================================
export const authApi = {
  login: (userNameOrEmail: string, password: string) =>
    apiClient.post<Types.AuthResponse>("/auth/login", { userNameOrEmail, password }),
  
  register: (data: Types.RegisterDto) =>
    apiClient.post<Types.AuthResponse>("/auth/register", data),
  
  googleLogin: (idToken: string) =>
    apiClient.post<Types.AuthResponse>("/auth/google-login", { idToken }),
  
  logout: () => {
    apiClient.setToken(null);
    localStorage.removeItem("user");
  },
};

// ============================================
// Sessions API
// ============================================
export const sessionsApi = {
  getAll: () => apiClient.get<Types.SessionResponseDto[]>("/sessions"),
  
  getById: (id: number) => apiClient.get<Types.SessionResponseDto>(`/sessions/${id}`),
  
  create: (data: Types.CreateSessionDto) => 
    apiClient.post<Types.SessionResponseDto>("/sessions", data),
  
  update: (id: number, data: Types.UpdateSessionDto) => 
    apiClient.put<void>(`/sessions/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/sessions/${id}`),
};

// ============================================
// Bookings API
// ============================================
export const bookingsApi = {
  getAll: () => apiClient.get<Types.BookingResponseDto[]>("/bookings"),
  
  getById: (id: number) => apiClient.get<Types.BookingResponseDto>(`/bookings/${id}`),
  
  // Smart booking - uses JWT token to get memberId automatically
  bookSession: (sessionId: number) => 
    apiClient.post<Types.BookingResponseDto>("/bookings/book", { sessionId }),
  
  // Get current user's bookings
  getMyBookings: () => apiClient.get<Types.BookingResponseDto[]>("/bookings/my-bookings"),
  
  // Cancel a booking
  cancelBooking: (bookingId: number) => 
    apiClient.post<void>(`/bookings/cancel/${bookingId}`),
  
  // Admin: create booking manually
  create: (data: Types.CreateBookingDto) => 
    apiClient.post<Types.BookingResponseDto>("/bookings", data),
  
  // Admin: update booking status
  update: (id: number, data: Types.UpdateBookingDto) => 
    apiClient.put<void>(`/bookings/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/bookings/${id}`),
};

// ============================================
// MemberProfiles API
// ============================================
export const memberProfilesApi = {
  getAll: () => apiClient.get<Types.MemberProfileResponseDto[]>("/memberprofiles"),
  
  getById: (id: number) => apiClient.get<Types.MemberProfileResponseDto>(`/memberprofiles/${id}`),
  
  // Get current user's profile
  getMyProfile: () => apiClient.get<Types.MemberProfileResponseDto>("/memberprofiles/me"),
  
  create: (data: Types.CreateMemberProfileDto) => 
    apiClient.post<Types.MemberProfileResponseDto>("/memberprofiles", data),
  
  update: (id: number, data: Types.UpdateMemberProfileDto) => 
    apiClient.put<void>(`/memberprofiles/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/memberprofiles/${id}`),
};

// ============================================
// CoachProfiles API
// ============================================
export const coachProfilesApi = {
  getAll: () => apiClient.get<Types.CoachProfileResponseDto[]>("/coachprofiles"),
  
  getMyProfile: () => apiClient.get<Types.CoachProfileResponseDto>("/coachprofiles/me"),

  getById: (id: number) => apiClient.get<Types.CoachProfileResponseDto>(`/coachprofiles/${id}`),
  
  create: (data: Types.CreateCoachProfileDto) => 
    apiClient.post<Types.CoachProfileResponseDto>("/coachprofiles", data),
  
  update: (id: number, data: Types.UpdateCoachProfileDto) => 
    apiClient.put<void>(`/coachprofiles/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/coachprofiles/${id}`),
};

// ============================================
// ClassTypes API
// ============================================
export const classTypesApi = {
  getAll: () => apiClient.get<Types.ClassTypeResponseDto[]>("/classtypes"),
  
  getById: (id: number) => apiClient.get<Types.ClassTypeResponseDto>(`/classtypes/${id}`),
  
  create: (data: Types.CreateClassTypeDto) => 
    apiClient.post<Types.ClassTypeResponseDto>("/classtypes", data),
  
  update: (id: number, data: Types.UpdateClassTypeDto) => 
    apiClient.put<void>(`/classtypes/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/classtypes/${id}`),
};

// ============================================
// Feedback API
// ============================================
export const feedbackApi = {
  getAll: () => apiClient.get<Types.FeedbackResponseDto[]>("/feedbacks"),
  
  getById: (id: number) => apiClient.get<Types.FeedbackResponseDto>(`/feedbacks/${id}`),
  
  create: (data: Types.CreateFeedbackDto) => 
    apiClient.post<Types.FeedbackResponseDto>("/feedbacks", data),
  
  update: (id: number, data: Types.UpdateFeedbackDto) => 
    apiClient.put<void>(`/feedbacks/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/feedbacks/${id}`),
};

// ============================================
// Attendance API
// ============================================
export const attendanceApi = {
  getAll: () => apiClient.get<Types.AttendanceResponseDto[]>("/attendances"),
  
  getById: (id: number) => apiClient.get<Types.AttendanceResponseDto>(`/attendances/${id}`),
  
  create: (data: Types.CreateAttendanceDto) => 
    apiClient.post<Types.AttendanceResponseDto>("/attendances", data),
  
  update: (id: number, data: Types.UpdateAttendanceDto) => 
    apiClient.put<void>(`/attendances/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/attendances/${id}`),
};


// ============================================
// MemberSetProgress API
// ============================================
export const memberSetProgressApi = {
  getAll: () => apiClient.get<Types.MemberSetProgressResponseDto[]>("/membersetprogress"),
  
  getById: (id: number) => apiClient.get<Types.MemberSetProgressResponseDto>(`/membersetprogress/${id}`),
  
  create: (data: Types.CreateMemberSetProgressDto) => 
    apiClient.post<Types.MemberSetProgressResponseDto>("/membersetprogress", data),
  
  update: (id: number, data: Types.UpdateMemberSetProgressDto) => 
    apiClient.put<void>(`/membersetprogress/${id}`, data),
  
  delete: (id: number) => apiClient.delete<void>(`/membersetprogress/${id}`),
};
// ============================================
// Users API (Admin)
// ============================================
export const usersApi = {
  getAll: () => apiClient.get<any[]>("/users"),
  getMe: () => apiClient.get<any>("/users/me"),
  getByUserName: (userName: string) => apiClient.get<any>(`/users/${userName}`),
  getByRole: (roleName: string) => apiClient.get<any[]>(`/users/role/${roleName}`),
  updateMe: (data: any) => apiClient.put<any>("/users/me", data),
  updateRole: (userName: string, roleName: string) => 
    apiClient.put<any>(`/users/${userName}/role`, roleName),
  delete: (userName: string) => apiClient.delete<any>(`/users/${userName}`),
};
