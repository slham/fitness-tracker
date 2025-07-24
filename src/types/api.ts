// API Types based on swagger.yml

export interface User {
  id: string;
  username: string;
  email: string;
  created: string;
  updated: string;
  isActive: boolean;
  isSuspended: boolean;
  isVerified: boolean;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  created: string;
  updated: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Workout {
  id: string;
  name: string;
  user_id: string;
  created: string;
  updated: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  muscles: Muscle[];
  sets: Set[];
}

export interface Muscle {
  name: string;
  muscleGroup:
    | "arms"
    | "back"
    | "chest"
    | "core"
    | "heart"
    | "legs"
    | "shoulders";
}

export interface Set {
  weight: number;
  reps: number;
}

export interface CreateWorkoutRequest {
  name: string;
  exercises: Exercise[];
}

export interface UpdateWorkoutRequest {
  name?: string;
  exercises?: Exercise[];
}

export interface Calendar {
  id: string;
  name: string;
  user_id: string;
  created: string;
  updated: string;
}

export interface CreateCalendarRequest {
  name: string;
}

export interface UpdateCalendarRequest {
  name?: string;
}

export interface Snapshot {
  id: string;
  calendar_id: string;
  done: string;
  workout: Workout;
  created: string;
  updated: string;
}

export interface CreateSnapshotRequest {
  done: string;
  workout: Workout;
}

export interface UpdateSnapshotRequest {
  done?: string;
  workout?: Workout;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
}

// Query parameters
export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: "asc" | "desc";
  sort_column?: "created" | "updated" | "id";
}
