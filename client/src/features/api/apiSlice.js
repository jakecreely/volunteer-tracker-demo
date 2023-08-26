import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery(
        { 
            baseUrl: process.env.REACT_APP_BASE_URL,
            prepareHeaders: (headers) => {
                const token = window.localStorage.getItem('access_token')
                // If we have a token set in state, let's assume that we should be passing it.
                if (token) {
                  headers.set('authorization', `Bearer ${token}`)
                }
                return headers
              }, 
        }),
    tagTypes: ['Volunteer', 'Award', 'Training', 'Role', 'Document'],
    endpoints: (builder) => ({
        // Volunteer Endpoints
        getVolunteers: builder.query({
            query: () => '/volunteers',
            providesTags: ['Volunteer']

        }),
        getVolunteerById: builder.query({
            query: (id) => `/volunteers/${id}`,
            providesTags: ['Volunteer']
        }),
        getUpcomingVolunteerBirthdays: builder.query({
            query: (days) => `/volunteers/birthdays/upcoming/${days}`,
            providesTags: ['Volunteer']
        }),
        getOutstandingDocuments: builder.query({
            query: () => '/volunteers/outstanding-documents',
            providesTags: ['Volunteer']
        }),
        getUpcomingAwards: builder.query({
            query: (days) => `/volunteers/awards/upcoming/${days}`,
            providesTags: ['Volunteer']
        }),
        getUpcomingTraining: builder.query({
            query: (days) => `/volunteers/training/upcoming/${days}`,
            providesTags: ['Volunteer']
        }),
        getUpcomingAwardsByVolunteer: builder.query({
            query: (id, days) => `/volunteers/${id}/awards/upcoming/${days}`,
            providesTags: ['Volunteer']
        }),
        getUpcomingTrainingByVolunteer: builder.query({
            query: (id, days) => `/volunteers/${id}/training/upcoming/${days}`,
            providesTags: ['Volunteer']
        }),
        updateAllVolunteerTraining: builder.mutation({
            query: () => ({
                url: `/volunteers/training`,
                method: 'PUT'
            }),
            invalidatesTags: ['Volunteer']
        }),
        updateAllVolunteerAwards: builder.mutation({
            query: () => ({
                url: `/volunteers/awards/update`,
                method: 'PUT'
            }),
            invalidatesTags: ['Volunteer']
        }),
        addVolunteer: builder.mutation({
            query: (newVolunteer) => ({
                url: '/volunteers',
                method: 'POST',
                body: newVolunteer
            }),
            invalidatesTags: ['Volunteer']
        }),
        updateVolunteer: builder.mutation({
            query: (updatedVolunteer) => ({
                url: `/volunteers/${updatedVolunteer._id}`,
                method: 'PUT',
                body: updatedVolunteer
            }),
            invalidatesTags: ['Volunteer']
        }),
        deleteVolunteer: builder.mutation({
            query: (id) => ({
                url: `/volunteers/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Volunteer']
        }),
        // Award Endpoints
        getAwards: builder.query({
            query: () => '/awards',
            providesTags: ['Award']
        }),
        getAwardById: builder.query({
            query: (id) => `/awards/${id}`,
            providesTags: ['Award']
        }),
        addAward: builder.mutation({
            query: (newAward) => ({
                url: '/awards',
                method: 'POST',
                body: newAward
            }),
            invalidatesTags: ['Award']
        }),
        updateAward: builder.mutation({
            query: (updatedAward) => ({
                url: `/awards/${updatedAward._id}`,
                method: 'PUT',
                body: updatedAward
            }),
            invalidatesTags: ['Award']
        }),
        deleteAward: builder.mutation({
            query: (id) => ({
                url: `/awards/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Award']
        }),
        autoFillAwards: builder.mutation({
            query: ({startDate, breakDuration}) => ({
                url: `/awards/auto-fill/${startDate}&${breakDuration}`,
                method: 'GET'
            }),
        }),
        // Training Endpoints
        getTraining: builder.query({
            query: () => '/training',
            providesTags: ['Training']
        }),
        getTrainingById: builder.query({
            query: (id) => `/training/${id}`,
            providesTags: ['Training']
        }),
        addTraining: builder.mutation({
            query: (newTraining) => ({
                url: '/training',
                method: 'POST',
                body: newTraining
            }),
            invalidatesTags: ['Training']
        }),
        updateTraining: builder.mutation({
            query: (updatedTraining) => ({
                url: `/training/${updatedTraining._id}`,
                method: 'PUT',
                body: updatedTraining
            }),
            invalidatesTags: ['Training']
        }),
        deleteTraining: builder.mutation({
            query: (id) => ({
                url: `/training/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Training']
        }),
        // Roles Endpoints
        getRoles: builder.query({
            query: () => '/roles',
            providesTags: ['Role']
        }),
        getRoleById: builder.query({
            query: (id) => `/roles/${id}`,
            providesTags: ['Role']
        }),
        addRole: builder.mutation({
            query: (newRole) => ({
                url: '/roles',
                method: 'POST',
                body: newRole
            }),
            invalidatesTags: ['Role']
        }),
        updateRole: builder.mutation({
            query: (updatedRole) => ({
                url: `/roles/${updatedRole._id}`,
                method: 'PUT',
                body: updatedRole
            }),
            invalidatesTags: ['Role']
        }),
        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Role']
        }),
        // Documents Endpoints
        getDocuments: builder.query({
            query: () => '/documents',
            providesTags: ['Document']
        }),
        getDocumentById: builder.query({
            query: (id) => `/documents/${id}`,
            providesTags: ['Document']
        }),
        addDocument: builder.mutation({
            query: (newDocument) => ({
                url: '/documents',
                method: 'POST',
                body: newDocument
            }),
            invalidatesTags: ['Document']
        }),
        updateDocument: builder.mutation({
            query: (updatedDocument) => ({
                url: `/documents/${updatedDocument._id}`,
                method: 'PUT',
                body: updatedDocument
            }),
            invalidatesTags: ['Document']
        }),
        deleteDocument: builder.mutation({
            query: (id) => ({
                url: `/documents/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Document']
        })
    })
}) 

export const {
    // Volunteer Endpoints
    useGetVolunteersQuery, 
    useGetVolunteerByIdQuery,
    useGetUpcomingVolunteerBirthdaysQuery,
    useGetOutstandingDocumentsQuery,
    useGetUpcomingAwardsQuery,
    useGetUpcomingTrainingQuery,
    useGetUpcomingAwardsByVolunteerQuery,
    useGetUpcomingTrainingByVolunteerQuery,
    useUpdateAllVolunteerTrainingMutation,
    useUpdateAllVolunteerAwardsMutation,
    useAddVolunteerMutation,
    useUpdateVolunteerMutation,
    useDeleteVolunteerMutation,

    // Award Endpoints
    useGetAwardsQuery,
    useGetAwardByIdQuery,
    useAddAwardMutation,
    useUpdateAwardMutation,
    useDeleteAwardMutation,
    useAutoFillAwardsMutation,

    // Training Endpoints
    useGetTrainingQuery,
    useGetTrainingByIdQuery,
    useAddTrainingMutation,
    useUpdateTrainingMutation,
    useDeleteTrainingMutation,

    // Roles Endpoints
    useGetRolesQuery,
    useGetRoleByIdQuery,
    useAddRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,

    // Documents Endpoints
    useGetDocumentsQuery,
    useGetDocumentByIdQuery,
    useAddDocumentMutation,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation
} = apiSlice