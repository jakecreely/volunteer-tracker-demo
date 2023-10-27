import { createSlice } from '@reduxjs/toolkit'
import { addRole, getRoles, updateRole, deleteRole } from '../api/roleApi';

const roleSlice = createSlice({
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
                state.roles = action.payload;
                state.status = 'fulfilled'
            })
            .addCase(getRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.status = 'rejected'
            })
            .addCase(addRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(addRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles.push(action.payload);
            })
            .addCase(addRole.rejected, (state, action) => {
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

// Check the usage of selectors
const selectRoles = state => state.roles.roles

const selectRoleById = (state, roleId) => state.roles.roles.find(role => role.id === roleId)

export default roleSlice.reducer