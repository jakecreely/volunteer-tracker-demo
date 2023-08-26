import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { deleteProtected, getProtected, postProtected, putProtected } from '../../services/api.services'

export const documentsSlice = createSlice({
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

export const getDocuments = createAsyncThunk('documents/getDocuments', async () => {
    const response = await getProtected('/documents')
    return response
})

export const addDocument = createAsyncThunk('documents/addDocument', async (document) => {
    const response = await postProtected('/documents', document)
    return response
})

export const updateDocument = createAsyncThunk('documents/updateDocument', async (document) => {
    const response = await putProtected(`/document/${document.id}`, document)
    return response
})

export const deleteDocument = createAsyncThunk('documents/deleteDocument', async (document) => {
    const response = await deleteProtected(`/documents/${document.id}`)
    return response
})

export const selectDocuments = state => state.documents.documents

export const selectDocumentById = (state, documentId) => state.documents.documents.find(document => document.id === documentId)

export default documentsSlice.reducer