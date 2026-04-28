export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  realName: string;
  studentId: string;
  avatar: string;
  status: number;
  roles: string[];
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  realName?: string;
  studentId?: string;
}
