import { createSlice } from '@reduxjs/toolkit'
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../api/documentsApi';

const documentsSlice = createSlice({
    name: 'documents',
    initialState: {
        documents: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDocuments.pending, (state) => {
                state.loading = true;
                state.status = 'pending'
            })
            .addCase(getDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload;
                state.status = 'fulfilled'
            })
            .addCase(getDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.status = 'rejected'
            })
            .addCase(addDocument.pending, (state) => {
                state.loading = true;
            })
            .addCase(addDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.documents.push(action.payload);
            })
            .addCase(addDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateDocument.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateDocument.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.documents.findIndex(document => document.id === action.payload.id)
                if (index !== -1) {
                    state.documents[index] = action.payload
                }
            })
            .addCase(updateDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deleteDocument.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = state.documents.filter(document => document.id !== action.payload.id)
            })
            .addCase(deleteDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
})

const selectDocuments = state => state.documents.documents

const selectDocumentById = (state, documentId) => state.documents.documents.find(document => document.id === documentId)

export default documentsSlice.reducer