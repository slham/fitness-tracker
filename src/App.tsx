import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/layout/Navigation';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import WorkoutForm from './components/workout/WorkoutForm';
import Progress from './components/progress/Progress';
import CalendarList from './components/calendar/CalendarList';
import CalendarForm from './components/calendar/CalendarForm';
import CalendarView from './components/calendar/CalendarView';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/new"
              element={
                <ProtectedRoute>
                  <WorkoutForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/:id/edit"
              element={
                <ProtectedRoute>
                  <WorkoutForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendars"
              element={
                <ProtectedRoute>
                  <CalendarList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar/new"
              element={
                <ProtectedRoute>
                  <CalendarForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar/:id/edit"
              element={
                <ProtectedRoute>
                  <CalendarForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar/:id"
              element={
                <ProtectedRoute>
                  <CalendarView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
