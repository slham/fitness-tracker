import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Add,
  ChevronLeft,
  ChevronRight,
  Today,
  FitnessCenter,
  Delete,
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { Calendar, Snapshot, Workout } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AddSnapshotDialog from './AddSnapshotDialog';

const CalendarView: React.FC = () => {
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [calendarData, snapshotsData, workoutsData] = await Promise.all([
        apiService.getCalendar(user!.id, id!),
        apiService.getSnapshots(user!.id, id!),
        apiService.getWorkouts(user!.id),
      ]);
      
      setCalendar(calendarData);
      setSnapshots(snapshotsData);
      setWorkouts(workoutsData);
    } catch (err: any) {
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (window.confirm('Are you sure you want to delete this workout snapshot?')) {
      try {
        await apiService.deleteSnapshot(user!.id, id!, snapshotId);
        await fetchData();
        setSelectedSnapshot(null);
      } catch (err) {
        setError('Failed to delete snapshot');
      }
    }
  };

  const handleAddSnapshot = (date: Date) => {
    setSelectedDate(date);
    setShowAddDialog(true);
  };

  const handleSnapshotAdded = () => {
    setShowAddDialog(false);
    setSelectedDate(null);
    fetchData();
  };

  const getSnapshotsForDate = (date: Date): Snapshot[] => {
    return snapshots.filter(snapshot => 
      isSameDay(new Date(snapshot.done), date)
    );
  };

  const renderWorkoutDetails = (workout: Workout) => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>{workout.name}</Typography>
        {workout.exercises.map((exercise, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {exercise.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exercise.sets.length} sets • {exercise.muscles.map(m => m.name).join(', ')}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < dateRange.length; i += 7) {
      weeks.push(dateRange.slice(i, i + 7));
    }

    return (
      <Box sx={{ mt: 3 }}>
        {/* Calendar Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5">
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Today Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Today />}
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </Box>

        {/* Day Headers */}
        <Grid container sx={{ mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid key={day}>
              <Paper 
                sx={{ 
                  p: 1, 
                  textAlign: 'center', 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  fontWeight: 'bold'
                }}
              >
                <Typography variant="body2">{day}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        {weeks.map((week, weekIndex) => (
          <Grid container key={weekIndex} sx={{ mb: 1 }}>
            {week.map((date) => {
              const daySnapshots = getSnapshotsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isToday = isSameDay(date, new Date());

              return (
                <Grid key={date.toString()}>
                  <Paper
                    sx={{
                      minHeight: 100,
                      p: 1,
                      cursor: 'pointer',
                      border: isToday ? 2 : 1,
                      borderColor: isToday ? 'primary.main' : 'divider',
                      bgcolor: !isCurrentMonth ? 'action.hover' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                    onClick={() => handleAddSnapshot(date)}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: !isCurrentMonth ? 'text.secondary' : 'text.primary',
                        mb: 1,
                      }}
                    >
                      {format(date, 'd')}
                    </Typography>
                    
                    {daySnapshots.map((snapshot) => {
                      let workout: Workout;
                      try {
                        workout = snapshot.workout;
                      } catch (e) {
                        return null;
                      }
                      
                      return (
                        <Box
                          key={snapshot.id}
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            p: 0.5,
                            mb: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSnapshot(snapshot);
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {workout.name}
                          </Typography>
                        </Box>
                      );
                    })}
                    
                    {daySnapshots.length === 0 && isCurrentMonth && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '60px',
                          opacity: 0.3,
                          '&:hover': { opacity: 0.7 },
                        }}
                      >
                        <Add fontSize="small" />
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!calendar) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Calendar not found</Alert>
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

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          component="button" 
          onClick={() => navigate('/calendars')}
          underline="hover"
          color="inherit"
        >
          Calendars
        </Link>
        <Typography color="text.primary">
          {calendar.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/calendars')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">
            {calendar.name}
          </Typography>
        </Box>
        {!isMobile && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/calendar/${id}/edit`)}
          >
            Edit Calendar
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          {renderCalendarGrid()}
        </CardContent>
      </Card>

      {/* Snapshot Details Dialog */}
      <Dialog
        open={Boolean(selectedSnapshot)}
        onClose={() => setSelectedSnapshot(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSnapshot && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  Workout on {format(new Date(selectedSnapshot.done), 'MMMM d, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Added {format(parseISO(selectedSnapshot.created), 'MMM d, yyyy')}
                </Typography>
              </Box>
              <IconButton
                color="error"
                onClick={() => handleDeleteSnapshot(selectedSnapshot.id)}
              >
                <Delete />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {(() => {
                try {
                  const workout = selectedSnapshot.workout;
                  return renderWorkoutDetails(workout);
                } catch (e) {
                  return <Typography color="error">Invalid workout data</Typography>;
                }
              })()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSnapshot(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Snapshot Dialog */}
      <AddSnapshotDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedDate(null);
        }}
        onSnapshotAdded={handleSnapshotAdded}
        selectedDate={selectedDate}
        calendarId={id!}
        workouts={workouts}
      />

      {/* Mobile Edit FAB */}
      {isMobile && (
        <Fab
          color="secondary"
          aria-label="edit calendar"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
          }}
          onClick={() => navigate(`/calendar/${id}/edit`)}
        >
          <Edit />
        </Fab>
      )}
    </Container>
  );
};

export default CalendarView;
