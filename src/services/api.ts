import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  Workout,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Calendar,
  CreateCalendarRequest,
  UpdateCalendarRequest,
  Snapshot,
  CreateSnapshotRequest,
  UpdateSnapshotRequest,
  PaginationParams,
} from '../types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://localhost',
      timeout: 3000,
      withCredentials: true, // Important for cookie authentication
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials':true,
        'Accept': '*/*',
        'Accept-Language': 'en-us,en;q=0.5',
      },
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<User> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  // User endpoints
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async getUsers(params?: PaginationParams): Promise<User[]> {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.api.patch(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  // Workout endpoints
  async createWorkout(userId: string, workoutData: CreateWorkoutRequest): Promise<Workout> {
    const response = await this.api.post(`/users/${userId}/workouts`, workoutData);
    return response.data;
  }

  async getWorkouts(userId: string, params?: PaginationParams): Promise<Workout[]> {
    const response = await this.api.get(`/users/${userId}/workouts`, { params });
    return response.data;
  }

  async getWorkout(userId: string, workoutId: string): Promise<Workout> {
    const response = await this.api.get(`/users/${userId}/workouts/${workoutId}`);
    return response.data;
  }

  async updateWorkout(
    userId: string,
    workoutId: string,
    workoutData: UpdateWorkoutRequest
  ): Promise<Workout> {
    const response = await this.api.patch(`/users/${userId}/workouts/${workoutId}`, workoutData);
    return response.data;
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    await this.api.delete(`/users/${userId}/workouts/${workoutId}`);
  }

  // Calendar endpoints
  async createCalendar(userId: string, calendarData: CreateCalendarRequest): Promise<Calendar> {
    const response = await this.api.post(`/users/${userId}/calendars`, calendarData);
    return response.data;
  }

  async getCalendars(userId: string, params?: PaginationParams): Promise<Calendar[]> {
    const response = await this.api.get(`/users/${userId}/calendars`, { params });
    return response.data;
  }

  async getCalendar(userId: string, calendarId: string): Promise<Calendar> {
    const response = await this.api.get(`/users/${userId}/calendars/${calendarId}`);
    return response.data;
  }

  async updateCalendar(
    userId: string,
    calendarId: string,
    calendarData: UpdateCalendarRequest
  ): Promise<Calendar> {
    const response = await this.api.patch(`/users/${userId}/calendars/${calendarId}`, calendarData);
    return response.data;
  }

  async deleteCalendar(userId: string, calendarId: string): Promise<void> {
    await this.api.delete(`/users/${userId}/calendars/${calendarId}`);
  }

  // Snapshot endpoints
  async createSnapshot(
    userId: string,
    calendarId: string,
    snapshotData: CreateSnapshotRequest
  ): Promise<Snapshot> {
    const response = await this.api.post(`/users/${userId}/calendars/${calendarId}/snapshots`, snapshotData);
    return response.data;
  }

  async getSnapshots(
    userId: string,
    calendarId: string,
    params?: PaginationParams
  ): Promise<Snapshot[]> {
    const response = await this.api.get(`/users/${userId}/calendars/${calendarId}/snapshots`, { params });
    return response.data;
  }

  async getSnapshot(
    userId: string,
    calendarId: string,
    snapshotId: string
  ): Promise<Snapshot> {
    const response = await this.api.get(`/users/${userId}/calendars/${calendarId}/snapshots/${snapshotId}`);
    return response.data;
  }

  async updateSnapshot(
    userId: string,
    calendarId: string,
    snapshotId: string,
    snapshotData: UpdateSnapshotRequest
  ): Promise<Snapshot> {
    const response = await this.api.patch(
      `/users/${userId}/calendars/${calendarId}/snapshots/${snapshotId}`,
      snapshotData
    );
    return response.data;
  }

  async deleteSnapshot(
    userId: string,
    calendarId: string,
    snapshotId: string
  ): Promise<void> {
    await this.api.delete(`/users/${userId}/calendars/${calendarId}/snapshots/${snapshotId}`);
  }
}

export const apiService = new ApiService();
