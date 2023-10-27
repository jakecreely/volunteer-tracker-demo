import { createSlice } from '@reduxjs/toolkit'
import { addAward, getAwards, updateAward, deleteAward } from '../api/awardsApi';

const awardsSlice = createSlice({
    name: 'awards',
    initialState: {
        awards: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAwards.pending, (state) => {
                state.loading = true;
                state.status = 'pending'
            })
            .addCase(getAwards.fulfilled, (state, action) => {
                state.loading = false;
                state.awards = action.payload;
                state.status = 'fulfilled'
            })
            .addCase(getAwards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.status = 'rejected'
            })
            .addCase(addAward.pending, (state) => {
                state.loading = true;
            })
            .addCase(addAward.fulfilled, (state, action) => {
                state.loading = false;
                state.awards.push(action.payload);
            })
            .addCase(addAward.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateAward.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateAward.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.awards.findIndex(award => award.id === action.payload.id)
                if (index !== -1) {
                    state.awards[index] = action.payload
                }
            })
            .addCase(updateAward.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deleteAward.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteAward.fulfilled, (state, action) => {
                state.loading = false;
                state.awards = state.awards.filter(award => award.id !== action.payload.id)
            })
            .addCase(deleteAward.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
})

const selectAwards = state => state.awards.awards

const selectAwardById = (state, awardId) => state.awards.awards.find(award => award.id === awardId)

export default awardsSlice.reducer