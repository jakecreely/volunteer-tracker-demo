import { createAsyncThunk } from "@reduxjs/toolkit"
import { getProtected, postProtected, putProtected, deleteProtected } from "../../../lib/apiRequests"

const getTraining = createAsyncThunk('training/getTraining', async () => {
    const response = await getProtected('/training')
    return response
})

const addTraining = createAsyncThunk('training/addTraining', async (training) => {
    const response = await postProtected('/training', training)
    return response
})

const updateTraining = createAsyncThunk('training/updateTraining', async (training) => {
    const response = await putProtected(`/training/${training.id}`, training)
    return response
})

const deleteTraining = createAsyncThunk('training/deleteTraining', async (training) => {
    const response = await deleteProtected(`/training/${training.id}`)
    return response
})

export { getTraining, addTraining, updateTraining, deleteTraining }