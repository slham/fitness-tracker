import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  FitnessCenter,
  Timeline,
  Today,
  Edit,
  Delete,
  PlayArrow,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { Workout } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  avgWorkoutDuration: number;
}

const Dashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    totalExercises: 0,
    avgWorkoutDuration: 45,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWorkouts(user!.id, {
        limit: 10,
        sort: 'desc',
        sort_column: 'updated',
      });
      setWorkouts(data);
      calculateStats(data);
    } catch (err: any) {
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (workouts: Workout[]) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    const thisWeekWorkouts = workouts.filter(workout => 
      parseISO(workout.created) >= startOfWeek
    ).length;

    const totalExercises = workouts.reduce((total, workout) => 
      total + workout.exercises.length, 0
    );

    setStats({
      totalWorkouts: workouts.length,
      thisWeekWorkouts,
      totalExercises,
      avgWorkoutDuration: 45, // Mock data since duration isn't in API
    });
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await apiService.deleteWorkout(user!.id, workoutId);
        await fetchWorkouts();
      } catch (err) {
        setError('Failed to delete workout');
      }
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: { [key: string]: string } = {
      arms: '#2196F3',
      back: '#4CAF50',
      chest: '#FF9800',
      core: '#9C27B0',
      legs: '#F44336',
      shoulders: '#FF5722',
      heart: '#E91E63',
    };
    return colors[muscleGroup] || '#757575';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ready for your next workout? Let's get moving! 💪
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/workout/new')}
            sx={{ py: 2 }}
          >
            New Workout
          </Button>
        </Grid>
        <Grid>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Timeline />}
            onClick={() => navigate('/progress')}
            sx={{ py: 2 }}
          >
            View Progress
          </Button>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FitnessCenter sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {stats.totalWorkouts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Workouts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Today sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary">
                {stats.thisWeekWorkouts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                {stats.totalExercises}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Exercises Done
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'warning.main' }}>
                {stats.avgWorkoutDuration}m
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Duration
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Recent Workouts
          </Typography>
          {workouts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FitnessCenter sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No workouts yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start your fitness journey by creating your first workout!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/workout/new')}
              >
                Create First Workout
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {workouts.map((workout) => (
                <Grid key={workout.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {workout.name}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/workout/${workout.id}/edit`)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteWorkout(workout.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {format(parseISO(workout.created), 'MMM dd, yyyy')}
                      </Typography>

                      <Typography variant="body2" gutterBottom>
                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                      </Typography>

                      {/* Muscle Groups */}
                      <Box sx={{ mt: 2 }}>
                        {Array.from(new Set(
                          workout.exercises.flatMap(ex => 
                            ex.muscles.map(m => m.muscleGroup)
                          )
                        )).map((group) => (
                          <Chip
                            key={group}
                            label={group}
                            size="small"
                            sx={{
                              mr: 0.5,
                              mb: 0.5,
                              bgcolor: getMuscleGroupColor(group),
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/workout/${workout.id}/edit`)}
                        sx={{ mt: 2 }}
                        fullWidth={isMobile}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
