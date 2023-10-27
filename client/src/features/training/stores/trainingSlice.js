import { createSlice } from '@reduxjs/toolkit'
import { addTraining, deleteTraining, getTraining, updateTraining } from '../api/trainingApi';

const trainingSlice = createSlice({
    name: 'training',
    initialState: {
        training: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getTraining.pending, (state) => {
                state.loading = true;
                state.status = 'pending'
            })
            .addCase(getTraining.fulfilled, (state, action) => {
                state.loading = false;
                state.training = action.payload;
                state.status = 'fulfilled'
            })
            .addCase(getTraining.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.status = 'rejected'
            })
            .addCase(addTraining.pending, (state) => {
                state.loading = true;
            })
            .addCase(addTraining.fulfilled, (state, action) => {
                state.loading = false;
                state.training.push(action.payload);
            })
            .addCase(addTraining.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateTraining.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTraining.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.training.findIndex(training => training.id === action.payload.id)
                if (index !== -1) {
                    state.training[index] = action.payload
                }
            })
            .addCase(updateTraining.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deleteTraining.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteTraining.fulfilled, (state, action) => {
                state.loading = false;
                state.training = state.training.filter(training => training.id !== action.payload.id)
            })
            .addCase(deleteTraining.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
})

const selectTraining = state => state.training.training

const selectTrainingById = (state, trainingId) => state.training.training.find(training => training.id === trainingId)

export default trainingSlice.reducer