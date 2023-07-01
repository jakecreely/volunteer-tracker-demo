import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { deleteProtected, getProtected, postProtected, putProtected } from '../../services/api.services'

export const roleSlice = createSlice({
    name: 'roles',
    initialState: {
        roles: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRoles.pending, (state) => {
                state.loading = true;
                state.status = 'pending'
            })
            .addCase(getRoles.fulfilled, (state, action) => {
                state.loading = false;
                console.log('getRoles.fulfilled')
                console.log(action.payload)
                state.roles = action.payload;
                state.status = 'fulfilled'
            })
            .addCase(getRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.status = 'rejected'
            })
            .addCase(addRoles.pending, (state) => {
                state.loading = true;
            })
            .addCase(addRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles.push(action.payload);
            })
            .addCase(addRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.roles.findIndex(role => role.id === action.payload.id)
                if (index !== -1) {
                    state.roles[index] = action.payload
                }
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = state.roles.filter(role => role.id !== action.payload.id)
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
})

export const getRoles = createAsyncThunk('roles/getRoles', async () => {
    const response = await getProtected('/roles')
    return response
})

export const addRoles = createAsyncThunk('roles/addRole', async (role) => {
    const response = await postProtected('/roles/create', role)
    return response
})

export const updateRole = createAsyncThunk('roles/updateRole', async (role) => {
    const response = await putProtected(`/roles/update/${role.id}`, role)
    return response
})

export const deleteRole = createAsyncThunk('roles/deleteRole', async (role) => {
    const response = await deleteProtected(`/roles/delete/${role.id}`)
    return response
})

export const selectRoles = state => state.roles.roles

export const selectRoleById = (state, roleId) => state.roles.roles.find(role => role.id === roleId)

export default roleSlice.reducer