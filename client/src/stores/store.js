import { configureStore } from '@reduxjs/toolkit'
import { volunteersReducer } from '../features/volunteers'
import { rolesReducer } from '../features/roles'
import { trainingReducer } from '../features/training'
import { documentsReducer } from '../features/documents'
import { awardsReducer } from '../features/awards'
import { mailingListReducer } from '../features/mailing-list'
import { apiSlice } from '../lib/apiSlice'

export default configureStore({
  reducer: {
    volunteers: volunteersReducer,
    roles: rolesReducer,
    training: trainingReducer,
    documents: documentsReducer,
    awards: awardsReducer,
    mailingList: mailingListReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware)
})