import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  IconButton,
  Divider,
  Alert,
  Chip,
  Autocomplete,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Cancel,
  FitnessCenter,
  Remove,
} from '@mui/icons-material';
import { Exercise, Muscle, Set, CreateWorkoutRequest, UpdateWorkoutRequest } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const muscleGroups = ['arms', 'back', 'chest', 'core', 'heart', 'legs', 'shoulders'];

const commonExercises = [
  { name: 'Push-ups', muscles: [{ name: 'chest', muscleGroup: 'chest' }, { name: 'triceps', muscleGroup: 'arms' }] },
  { name: 'Squats', muscles: [{ name: 'quad', muscleGroup: 'legs' }, { name: 'glutes', muscleGroup: 'legs' }] },
  { name: 'Pull-ups', muscles: [{ name: 'lats', muscleGroup: 'back' }, { name: 'biceps', muscleGroup: 'arms' }] },
  { name: 'Bench Press', muscles: [{ name: 'chest', muscleGroup: 'chest' }, { name: 'triceps', muscleGroup: 'arms' }] },
  { name: 'Deadlifts', muscles: [{ name: 'hamstrings', muscleGroup: 'legs' }, { name: 'lats', muscleGroup: 'back' }] },
  { name: 'Shoulder Press', muscles: [{ name: 'deltoids', muscleGroup: 'shoulders' }] },
  { name: 'Plank', muscles: [{ name: 'abs', muscleGroup: 'core' }] },
  { name: 'Lunges', muscles: [{ name: 'quad', muscleGroup: 'legs' }, { name: 'glutes', muscleGroup: 'legs' }] },
  { name: 'Bicep Curls', muscles: [{ name: 'biceps', muscleGroup: 'arms' }] },
  { name: 'Tricep Dips', muscles: [{ name: 'triceps', muscleGroup: 'arms' }] },
];

const WorkoutForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined && id !== 'new';
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (isEditing) {
      fetchWorkout();
    } else {
      // Start with one empty exercise
      addExercise();
    }
  }, [id, isEditing]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const workout = await apiService.getWorkout(user!.id, id!);
      setWorkoutName(workout.name);
      setExercises(workout.exercises);
    } catch (err) {
      setError('Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      name: '',
      muscles: [],
      sets: [{ weight: 0, reps: 0 }],
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ weight: 0, reps: 0 });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExercises(updated);
  };

  const handleExerciseNameChange = (index: number, name: string) => {
    updateExercise(index, 'name', name);
  };

  const addMuscle = (exerciseIndex: number, muscleGroup: string) => {
    const updated = [...exercises];
    const muscle: Muscle = {
      name: muscleGroup,
      muscleGroup: muscleGroup as any,
    };
    
    // Avoid duplicates
    if (!updated[exerciseIndex].muscles.some(m => m.muscleGroup === muscleGroup)) {
      updated[exerciseIndex].muscles.push(muscle);
      setExercises(updated);
    }
  };

  const removeMuscle = (exerciseIndex: number, muscleIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].muscles = updated[exerciseIndex].muscles.filter((_, i) => i !== muscleIndex);
    setExercises(updated);
  };

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      setError('Workout name is required');
      return;
    }

    if (exercises.length === 0) {
      setError('At least one exercise is required');
      return;
    }

    const invalidExercises = exercises.filter(ex => !ex.name.trim() || ex.sets.length === 0);
    if (invalidExercises.length > 0) {
      setError('All exercises must have a name and at least one set');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workoutData = { name: workoutName, exercises };

      if (isEditing) {
        await apiService.updateWorkout(user!.id, id!, workoutData as UpdateWorkoutRequest);
      } else {
        await apiService.createWorkout(user!.id, workoutData as CreateWorkoutRequest);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save workout');
    } finally {
      setLoading(false);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FitnessCenter sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4">
              {isEditing ? 'Edit Workout' : 'Create New Workout'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Workout Name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., Morning Push Session, Leg Day"
          />

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Exercises
          </Typography>

          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex} variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Exercise {exerciseIndex + 1}</Typography>
                  <IconButton
                    onClick={() => removeExercise(exerciseIndex)}
                    color="error"
                    disabled={exercises.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid>
                    <Autocomplete
                      sx={{width:300}}
                      options={commonExercises.map(ex => ex.name)}
                      value={exercise.name}
                      onInputChange={(_, value) => handleExerciseNameChange(exerciseIndex, value)}
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Exercise Name"
                          placeholder="Start typing or select from suggestions"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid>
                    <Autocomplete
                      multiple
                      sx={{width:300}}
                      options={muscleGroups}
                      value={exercise.muscles.map(m => m.muscleGroup)}
                      onChange={(_, values) => {
                        const muscles: Muscle[] = values.map(v => ({
                          name: v,
                          muscleGroup: v as any,
                        }));
                        updateExercise(exerciseIndex, 'muscles', muscles);
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            label={option}
                            sx={{
                              bgcolor: getMuscleGroupColor(option),
                              color: 'white',
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Muscle Groups"
                          placeholder="Select muscle groups"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Sets
                </Typography>

                {exercise.sets.map((set, setIndex) => (
                  <Grid container spacing={2} key={setIndex} sx={{ mb: 1 }}>
                    <Grid>
                      <Typography sx={{ pt: 2 }}>
                        Set {setIndex + 1}
                      </Typography>
                    </Grid>
                    <Grid>
                      <TextField
                        label="Weight (lbs)"
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', Number(e.target.value))}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid>
                      <TextField
                        label="Reps"
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', Number(e.target.value))}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid>
                      <IconButton
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                        color="error"
                        disabled={exercise.sets.length === 1}
                      >
                        <Remove />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => addSet(exerciseIndex)}
                  sx={{ mt: 1 }}
                  size="small"
                >
                  Add Set
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addExercise}
            sx={{ mb: 3 }}
            fullWidth={isMobile}
          >
            Add Exercise
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Workout' : 'Create Workout')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default WorkoutForm;
