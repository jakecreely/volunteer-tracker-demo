import { createSlice } from '@reduxjs/toolkit'
import { getVolunteers, addVolunteer, updateVolunteer, deleteVolunteer } from '../api/volunteerApi';

const volunteersSlice = createSlice({
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

const selectVolunteers = state => state.volunteers.volunteers

const selectVolunteerById = (state, volunteerId) => state.volunteers.volunteers.find(volunteer => volunteer.id === volunteerId)

export default volunteersSlice.reducer