import { createAsyncThunk } from "@reduxjs/toolkit"
import { deleteProtected, getProtected, postProtected, putProtected } from "../../../lib/apiRequests"

export const getMailingList = createAsyncThunk('mailing-list/getMailingList', async () => {
    const response = await getProtected('/mailing-list')
    return response
})

export const addPersonToMailingList = createAsyncThunk('mailing-list/addPerson', async (person) => {
    const response = await postProtected('/mailing-list', person)
    return response
})

export const updatePersonOnMailingList = createAsyncThunk('mailing-list/updatePerson', async (person) => {
    const response = await putProtected(`/mailing-list/${person.id}`, person)
    return response
})

export const deletePersonOnMailingList = createAsyncThunk('mailing-list/deletePerson', async (person) => {
    const response = await deleteProtected(`/mailing-list/${person.id}`)
    return response
})