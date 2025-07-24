import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { Calendar, CreateCalendarRequest, UpdateCalendarRequest } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CalendarForm: React.FC = () => {
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  useEffect(() => {
    if (isEditing && user) {
      fetchCalendar();
    }
  }, [id, user, isEditing]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCalendar(user!.id, id!);
      setCalendar(data);
      setName(data.name);
    } catch (err: any) {
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Calendar name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (isEditing) {
        const updateData: UpdateCalendarRequest = { name: name.trim() };
        await apiService.updateCalendar(user!.id, id!, updateData);
      } else {
        const createData: CreateCalendarRequest = { name: name.trim() };
        await apiService.createCalendar(user!.id, createData);
      }

      navigate('/calendars');
    } catch (err: any) {
      setError(isEditing ? 'Failed to update calendar' : 'Failed to create calendar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/calendar/${id}`);
    } else {
      navigate('/calendars');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
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
        {isEditing && calendar && (
          <Link 
            component="button" 
            onClick={() => navigate(`/calendar/${id}`)}
            underline="hover"
            color="inherit"
          >
            {calendar.name}
          </Link>
        )}
        <Typography color="text.primary">
          {isEditing ? 'Edit Calendar' : 'New Calendar'}
        </Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleCancel}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5">
              {isEditing ? 'Edit Calendar' : 'Create New Calendar'}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Calendar Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              placeholder="e.g., Summer Workout Plan, Morning Routines, etc."
              helperText="Give your calendar a descriptive name"
              disabled={saving}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                startIcon={<Cancel />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || !name.trim()}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              >
                {saving ? 'Saving...' : isEditing ? 'Update Calendar' : 'Create Calendar'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CalendarForm;
