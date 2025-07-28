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
  IconButton,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  Edit,
  Delete,
  Event,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { Calendar } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CalendarList: React.FC = () => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (user) {
      fetchCalendars();
    }
  }, [user]);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCalendars(user!.id, {
        sort: 'desc',
        sort_column: 'updated',
      });
      setCalendars(data);
    } catch (err: any) {
      setError('Failed to load calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    if (window.confirm('Are you sure you want to delete this calendar? This will also delete all snapshots in this calendar.')) {
      try {
        await apiService.deleteCalendar(user!.id, calendarId);
        await fetchCalendars();
      } catch (err) {
        setError('Failed to delete calendar');
      }
    }
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

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Calendars
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/calendar/new')}
          >
            New Calendar
          </Button>
        )}
      </Box>

      {calendars.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No calendars yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first calendar to start scheduling your workouts!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/calendar/new')}
              >
                Create First Calendar
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {calendars.map((calendar) => (
              <Card 
                key={calendar.id}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => navigate(`/calendar/${calendar.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {calendar.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/calendar/${calendar.id}/edit`);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCalendar(calendar.id);
                        }}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created: {format(parseISO(calendar.created), 'MMM dd, yyyy')}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Updated: {format(parseISO(calendar.updated), 'MMM dd, yyyy')}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Event sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2" color="primary">
                      View Calendar
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>
      )}

      {/* Floating Action Button for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add calendar"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => navigate('/calendar/new')}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default CalendarList;
