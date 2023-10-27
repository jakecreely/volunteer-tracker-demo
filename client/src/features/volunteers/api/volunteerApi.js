import { createAsyncThunk } from "@reduxjs/toolkit"
import { getProtected, postProtected, putProtected, deleteProtected } from "../../../lib/apiRequests"

export const getVolunteers = createAsyncThunk('volunteers/getVolunteers', async () => {
    const response = await getProtected('/volunteers')
    return response
})

export const addVolunteer = createAsyncThunk('volunteers/addVolunteer', async (volunteer) => {
    const response = await postProtected('/volunteers', volunteer)
    return response
})

export const updateVolunteer = createAsyncThunk('volunteers/updateVolunteer', async (volunteer) => {
    const response = await putProtected(`/volunteers/${volunteer.id}`, volunteer)
    return response
})

export const deleteVolunteer = createAsyncThunk('volunteers/deleteVolunteer', async (volunteer) => {
    const response = await deleteProtected(`/volunteers/${volunteer.id}`)
    return response
})