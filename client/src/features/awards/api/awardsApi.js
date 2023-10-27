import { createAsyncThunk } from "@reduxjs/toolkit"
import { getProtected, postProtected, putProtected, deleteProtected } from "../../../lib/apiRequests"


export const getAwards = createAsyncThunk('awards/getAwards', async () => {
    const response = await getProtected('/awards')
    return response
})

export const addAward = createAsyncThunk('awards/addAward', async (award) => {
    const response = await postProtected('/awards', award)
    return response
})

export const updateAward = createAsyncThunk('awards/updateAward', async (award) => {
    const response = await putProtected(`/awards/${award.id}`, award)
    return response
})

export const deleteAward = createAsyncThunk('awards/deleteAward', async (award) => {
    const response = await deleteProtected(`/awards/${award.id}`)
    return response
})