import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { deleteProtected, getProtected, postProtected, putProtected } from '../../services/api.services'

export const trainingSlice = createSlice({
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

export const getTraining = createAsyncThunk('training/getTraining', async () => {
    const response = await getProtected('/training')
    return response
})

export const addTraining = createAsyncThunk('training/addTraining', async (training) => {
    const response = await postProtected('/training/create', training)
    return response
})

export const updateTraining = createAsyncThunk('training/updateTraining', async (training) => {
    const response = await putProtected(`/training/update/${training.id}`, training)
    return response
})

export const deleteTraining = createAsyncThunk('training/deleteTraining', async (training) => {
    const response = await deleteProtected(`/training/delete/${training.id}`)
    return response
})

export const selectTraining = state => state.training.training

export const selectTrainingById = (state, trainingId) => state.training.training.find(training => training.id === trainingId)

export default trainingSlice.reducer