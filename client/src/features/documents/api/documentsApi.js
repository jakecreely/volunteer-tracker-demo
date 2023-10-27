import { createAsyncThunk } from "@reduxjs/toolkit"
import { getProtected, postProtected, putProtected, deleteProtected } from "../../../lib/apiRequests"

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