import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery(
        { 
            baseUrl: process.env.REACT_APP_API_BASE_URL,
            prepareHeaders: (headers) => {
                const token = window.localStorage.getItem('access_token')
                // If we have a token set in state, let's assume that we should be passing it.
                if (token) {
                  headers.set('authorization', `Bearer ${token}`)
                }
                return headers
              }, 
        }),
    tagTypes: ['Volunteer', 'Award', 'Training', 'Role', 'Document', 'MailingList'],
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
            providesTags: ['Volunteer', 'Document']
        }),
        getUpcomingAwards: builder.query({
            query: (days) => `/volunteers/awards/upcoming/${days}`,
            providesTags: ['Volunteer', 'Award']
        }),
        getUpcomingTraining: builder.query({
            query: (days) => `/volunteers/training/upcoming/${days}`,
            providesTags: ['Volunteer', 'Training']
        }),
        getUpcomingAwardsByVolunteer: builder.query({
            query: ({id, days}) => `/volunteers/${id}/awards/upcoming/${days}`,
            providesTags: ['Volunteer', 'Award']
        }),
        getUpcomingTrainingByVolunteer: builder.query({
            query: ({id, days}) => `/volunteers/${id}/training/upcoming/${days}`,
            providesTags: ['Volunteer', 'Training']
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
            invalidatesTags: ['Volunteer', 'Role', 'Training', 'Award', 'Document'] // Role is used to for the volunteer usage on the roles page
        }),
        deleteVolunteer: builder.mutation({
            query: (id) => ({
                url: `/volunteers/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Volunteer']
        }),
        importVolunteers: builder.mutation({
            query: (csvFile) => ({
                url: '/volunteers/import',
                method: 'POST',
                body: csvFile
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
        getAwardsWithVolunteerUsage: builder.query({
            query: (id) => `/awards/${id}/volunteer-usage`,
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
        getTrainingWithVolunteerUsage: builder.query({
            query: (id) => `/training/${id}/volunteer-usage`,
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
        getRolesWithVolunteerUsage: builder.query({
            query: (id) => `/roles/${id}/volunteer-usage`,
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
            invalidatesTags: ['Role', 'Volunteer']
        }),
        updateRole: builder.mutation({
            query: (updatedRole) => ({
                url: `/roles/${updatedRole._id}`,
                method: 'PUT',
                body: updatedRole
            }),
            invalidatesTags: ['Role', 'Volunteer']
        }),
        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Role', 'Volunteer']
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
        getDocumentWithVolunteerUsage: builder.query({
            query: (id) => `/documents/${id}/volunteer-usage`,
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
        }),
        // Mailing List Endpoints
        getMailingList: builder.query({
            query: () => '/mailing-list',
            providesTags: ['MailingList']
        }),
        getPersonOnMailingListById: builder.query({
            query: (id) => `/mailing-list/${id}`,
            providesTags: ['MailingList']
        }),
        addPersonToMailingList: builder.mutation({
            query: (newPerson) => ({
                url: '/mailing-list',
                method: 'POST',
                body: newPerson
            }),
            invalidatesTags: ['MailingList']
        }),
        updatePersonOnMailingList: builder.mutation({
            query: (updatedPerson) => ({
                url: `/mailing-list/${updatedPerson._id}`,
                method: 'PUT',
                body: updatedPerson
            }),
            invalidatesTags: ['MailingList']
        }),
        deletePersonOnMailingList: builder.mutation({
            query: (id) => ({
                url: `/mailing-list/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['MailingList']
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
    useImportVolunteersMutation,

    // Award Endpoints
    useGetAwardsQuery,
    useGetAwardByIdQuery,
    useGetAwardsWithVolunteerUsageQuery,
    useAddAwardMutation,
    useUpdateAwardMutation,
    useDeleteAwardMutation,
    useAutoFillAwardsMutation,

    // Training Endpoints
    useGetTrainingQuery,
    useGetTrainingByIdQuery,
    useGetTrainingWithVolunteerUsageQuery,
    useAddTrainingMutation,
    useUpdateTrainingMutation,
    useDeleteTrainingMutation,

    // Roles Endpoints
    useGetRolesQuery,
    useGetRolesWithVolunteerUsageQuery,
    useGetRoleByIdQuery,
    useAddRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,

    // Documents Endpoints
    useGetDocumentsQuery,
    useGetDocumentByIdQuery,
    useGetDocumentWithVolunteerUsageQuery,
    useAddDocumentMutation,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation,

    // Mailing List Endpoints
    useGetMailingListQuery,
    useGetPersonOnMailingListByIdQuery,
    useAddPersonToMailingListMutation,
    useUpdatePersonOnMailingListMutation,
    useDeletePersonOnMailingListMutation
} = apiSlice