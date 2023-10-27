import { createAsyncThunk } from "@reduxjs/toolkit"
import { deleteProtected, getProtected, postProtected, putProtected } from "../../../lib/apiRequests"

const getRoles = createAsyncThunk('roles/getRoles', async () => {
    const response = await getProtected('/roles')
    return response
})

const addRole = createAsyncThunk('roles/addRole', async (role) => {
    const response = await postProtected('/roles', role)
    return response
})

const updateRole = createAsyncThunk('roles/updateRole', async (role) => {
    const response = await putProtected(`/roles/${role.id}`, role)
    return response
})

const deleteRole = createAsyncThunk('roles/deleteRole', async (role) => {
    const response = await deleteProtected(`/roles/${role.id}`)
    return response
})

export { getRoles, addRole, updateRole, deleteRole }
