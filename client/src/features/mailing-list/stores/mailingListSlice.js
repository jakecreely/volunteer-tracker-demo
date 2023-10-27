import { createSlice } from '@reduxjs/toolkit'
import { getMailingList, addPersonToMailingList, updatePersonOnMailingList, deletePersonOnMailingList } from '../api/mailingListApi';

const mailingListSlice = createSlice({
    name: 'mailing-list',
    initialState: {
        mailingList: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMailingList.pending, (state) => {
                state.loading = true;
                state.status = 'pending'
            })
            .addCase(getMailingList.fulfilled, (state, action) => {
                state.loading = false;
                state.status = 'fulfilled'
                state.mailingList = action.payload;
            })
            .addCase(getMailingList.rejected, (state, action) => {
                state.loading = false;
                state.status = 'rejected'
                state.error = action.error.message;
            })
            .addCase(addPersonToMailingList.pending, (state) => {
                state.loading = true;
            })
            .addCase(addPersonToMailingList.fulfilled, (state, action) => {
                state.loading = false;
                state.mailingList.push(action.payload);
            })
            .addCase(addPersonToMailingList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updatePersonOnMailingList.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePersonOnMailingList.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.mailingList.findIndex(person => person.id === action.payload.id)
                if (index !== -1) {
                    state.mailingList[index] = action.payload
                }
            })
            .addCase(updatePersonOnMailingList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deletePersonOnMailingList.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePersonOnMailingList.fulfilled, (state, action) => {
                state.loading = false;
                state.mailingList = state.mailingList.filter(person => person.id !== action.payload.id)
            })
            .addCase(deletePersonOnMailingList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
})

const selectMailingList = state => state.mailingList.mailingList

const selectPersonById = (state, personId) => state.mailingList.mailingList.find(person => person.id === personId)

export default mailingListSlice.reducer