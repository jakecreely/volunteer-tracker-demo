import { configureStore } from '@reduxjs/toolkit'
import volunteersReducer from '../features/volunteers/volunteerSlice'
import rolesReducer from '../features/roles/roleSlice'
import trainingReducer from '../features/training/trainingSlice'
import documentsReducer from '../features/documents/documentsSlice'
import awardsReducer from '../features/awards/awardsSlice'
import { apiSlice } from '../features/api/apiSlice'

export default configureStore({
  reducer: {
    volunteers: volunteersReducer,
    roles: rolesReducer,
    training: trainingReducer,
    documents: documentsReducer,
    awards: awardsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware)
})