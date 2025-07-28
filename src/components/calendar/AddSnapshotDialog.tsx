import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Workout, CreateSnapshotRequest } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AddSnapshotDialogProps {
  open: boolean;
  onClose: () => void;
  onSnapshotAdded: () => void;
  selectedDate: Date | null;
  calendarId: string;
  workouts: Workout[];
}

const AddSnapshotDialog: React.FC<AddSnapshotDialogProps> = ({
  open,
  onClose,
  onSnapshotAdded,
  selectedDate,
  calendarId,
  workouts,
}) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    if (open && selectedDate) {
      // Set default time to current time but on the selected date
      const now = new Date();
      const defaultDateTime = new Date(selectedDate);
      defaultDateTime.setHours(now.getHours());
      defaultDateTime.setMinutes(now.getMinutes());
      setSelectedDateTime(defaultDateTime);
      setSelectedWorkoutId('');
      setError('');
    }
  }, [open, selectedDate]);

  const handleSubmit = async () => {
    if (!selectedWorkoutId || !selectedDateTime) {
      setError('Please select a workout and date/time');
      return;
    }

    const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);
    if (!selectedWorkout) {
      setError('Selected workout not found');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Create snapshot with the workout data as JSON string
      const snapshotData: CreateSnapshotRequest = {
        done: selectedDateTime.toISOString(), // Unix timestamp in milliseconds
        workout: selectedWorkout
      };

      await apiService.createSnapshot(user!.id, calendarId, snapshotData);
      onSnapshotAdded();
    } catch (err: any) {
      setError('Failed to add workout snapshot');
    } finally {
      setSaving(false);
    }
  };

  const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Workout Snapshot
          {selectedDate && (
            <Typography variant="body2" color="text.secondary">
              for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Date/Time Picker */}
            <DateTimePicker
              label="Workout Date & Time"
              value={selectedDateTime}
              onChange={(newValue) => setSelectedDateTime(newValue)}
              disabled={saving}
              sx={{ width: '100%' }}
            />

            {/* Workout Selection */}
            <FormControl fullWidth disabled={saving}>
              <InputLabel>Select Workout</InputLabel>
              <Select
                value={selectedWorkoutId}
                onChange={(e) => setSelectedWorkoutId(e.target.value as string)}
                label="Select Workout"
              >
                {workouts.length === 0 ? (
                  <MenuItem disabled>
                    <Typography color="text.secondary">
                      No workouts available. Create a workout first.
                    </Typography>
                  </MenuItem>
                ) : (
                  workouts.map((workout) => (
                    <MenuItem key={workout.id} value={workout.id}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body1">{workout.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Workout Preview */}
            {selectedWorkout && (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Workout Preview: {selectedWorkout.name}
                </Typography>
                
                {/* Muscle Groups */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Muscle Groups:
                  </Typography>
                  {Array.from(new Set(
                    selectedWorkout.exercises.flatMap(ex => 
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

                {/* Exercises */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Exercises:
                </Typography>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <Box key={index} sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {exercise.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exercise.sets.length} sets • {exercise.muscles.map(m => m.name).join(', ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {workouts.length === 0 && (
              <Alert severity="info">
                You don't have any workouts yet. Create a workout first before adding it to your calendar.
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !selectedWorkoutId || !selectedDateTime || workouts.length === 0}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Adding...' : 'Add Snapshot'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddSnapshotDialog;
