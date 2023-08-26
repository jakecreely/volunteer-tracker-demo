import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { deleteProtected, getProtected, postProtected, putProtected } from '../../services/api.services'

export const volunteersSlice = createSlice({
    name: 'volunteers',
    initialState: {
        volunteers: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getVolunteers.pending, (state) => {
                state.loading = true;
                state.status = 'pending'
            })
            .addCase(getVolunteers.fulfilled, (state, action) => {
                state.loading = false;
                state.status = 'fulfilled'
                state.volunteers = action.payload;
            })
            .addCase(getVolunteers.rejected, (state, action) => {
                state.loading = false;
                state.status = 'rejected'
                state.error = action.error.message;
            })
            .addCase(addVolunteer.pending, (state) => {
                state.loading = true;
            })
            .addCase(addVolunteer.fulfilled, (state, action) => {
                state.loading = false;
                state.volunteers.push(action.payload);
            })
            .addCase(addVolunteer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateVolunteer.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateVolunteer.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.volunteers.findIndex(volunteer => volunteer.id === action.payload.id)
                if (index !== -1) {
                    state.volunteers[index] = action.payload
                }
            })
            .addCase(updateVolunteer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deleteVolunteer.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteVolunteer.fulfilled, (state, action) => {
                state.loading = false;
                state.volunteers = state.volunteers.filter(volunteer => volunteer.id !== action.payload.id)
            })
            .addCase(deleteVolunteer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
})

export const getVolunteers = createAsyncThunk('volunteers/getVolunteers', async () => {
    console.log('getting volunteers')
    const response = await getProtected('/volunteers')
    return response
})

export const addVolunteer = createAsyncThunk('volunteers/addVolunteer', async (volunteer) => {
    console.log('adding volunteer')
    const response = await postProtected('/volunteers', volunteer)
    return response
})

export const updateVolunteer = createAsyncThunk('volunteers/updateVolunteer', async (volunteer) => {
    console.log('updating volunteer')
    const response = await putProtected(`/volunteers/${volunteer.id}`, volunteer)
    return response
})

export const deleteVolunteer = createAsyncThunk('volunteers/deleteVolunteer', async (volunteer) => {
    console.log('deleting volunteer')
    const response = await deleteProtected(`/volunteers/${volunteer.id}`)
    return response
})

export const selectVolunteers = state => state.volunteers.volunteers

export const selectVolunteerById = (state, volunteerId) => state.volunteers.volunteers.find(volunteer => volunteer.id === volunteerId)

export default volunteersSlice.reducer