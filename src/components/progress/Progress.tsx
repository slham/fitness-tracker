import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  FitnessCenter,
  Today,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Workout } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface ProgressData {
  date: string;
  workouts: number;
  totalWeight: number;
  totalReps: number;
  exercises: number;
}

interface MuscleGroupData {
  name: string;
  value: number;
  color: string;
}

const Progress: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupData[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user, timeRange]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWorkouts(user!.id, {
        limit: 100,
        sort: 'desc',
        sort_column: 'created',
      });
      setWorkouts(data);
      processProgressData(data);
      processMuscleGroupData(data);
    } catch (err: any) {
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const processProgressData = (workouts: Workout[]) => {
    const now = new Date();
    let startDate: Date;
    let days: number;

    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now);
        days = 7;
        break;
      case 'month':
        startDate = subDays(now, 30);
        days = 30;
        break;
      case 'year':
        startDate = subDays(now, 365);
        days = 365;
        break;
    }

    const data: ProgressData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(now, days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayWorkouts = workouts.filter(workout => 
        format(parseISO(workout.created), 'yyyy-MM-dd') === dateStr
      );

      const totalWeight = dayWorkouts.reduce((total, workout) => 
        total + workout.exercises.reduce((exerciseTotal, exercise) =>
          exerciseTotal + exercise.sets.reduce((setTotal, set) =>
            setTotal + (set.weight * set.reps), 0
          ), 0
        ), 0
      );

      const totalReps = dayWorkouts.reduce((total, workout) => 
        total + workout.exercises.reduce((exerciseTotal, exercise) =>
          exerciseTotal + exercise.sets.reduce((setTotal, set) =>
            setTotal + set.reps, 0
          ), 0
        ), 0
      );

      const totalExercises = dayWorkouts.reduce((total, workout) => 
        total + workout.exercises.length, 0
      );

      data.push({
        date: timeRange === 'week' ? format(date, 'EEE') : format(date, 'MM/dd'),
        workouts: dayWorkouts.length,
        totalWeight,
        totalReps,
        exercises: totalExercises,
      });
    }

    setProgressData(data);
  };

  const processMuscleGroupData = (workouts: Workout[]) => {
    const muscleGroups: { [key: string]: number } = {};
    const colors: { [key: string]: string } = {
      arms: '#2196F3',
      back: '#4CAF50',
      chest: '#FF9800',
      core: '#9C27B0',
      legs: '#F44336',
      shoulders: '#FF5722',
      heart: '#E91E63',
    };

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.muscles.forEach(muscle => {
          muscleGroups[muscle.muscleGroup] = (muscleGroups[muscle.muscleGroup] || 0) + 1;
        });
      });
    });

    const data: MuscleGroupData[] = Object.entries(muscleGroups).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#757575',
    }));

    setMuscleGroupData(data);
  };

  const getTotalStats = () => {
    const totalWorkouts = workouts.length;
    const totalWeight = workouts.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) =>
        exerciseTotal + exercise.sets.reduce((setTotal, set) =>
          setTotal + (set.weight * set.reps), 0
        ), 0
      ), 0
    );

    const totalReps = workouts.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) =>
        exerciseTotal + exercise.sets.reduce((setTotal, set) =>
          setTotal + set.reps, 0
        ), 0
      ), 0
    );

    const uniqueExercises = new Set(
      workouts.flatMap(workout => workout.exercises.map(ex => ex.name))
    ).size;

    return { totalWorkouts, totalWeight, totalReps, uniqueExercises };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const stats = getTotalStats();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Timeline sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4">Progress Tracking</Typography>
      </Box>

      {/* Stats Overview */}
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
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                {Math.round(stats.totalWeight).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Weight Lifted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Today sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary">
                {stats.totalReps.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reps
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FitnessCenter sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ color: 'warning.main' }}>
                {stats.uniqueExercises}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unique Exercises
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            label="Time Range"
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Workouts Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="workouts" 
                      stroke="#2196F3" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Muscle Group Focus
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={muscleGroupData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {muscleGroupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Training Volume (Weight × Reps)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Total Volume']}
                    />
                    <Bar dataKey="totalWeight" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {workouts.length === 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Timeline sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Progress Data Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete some workouts to see your progress charts and analytics!
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Progress;
