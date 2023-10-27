import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import Dashboard from './features/dashboard/components/Dashboard'
import { NotFoundPage } from './components/NotFoundPage';
import { Card, Grid, LinearProgress } from '@mui/material';

export function Application() {

  const [birthdayLength, setBirthdayLength] = useState(31)
  const defaultFilterTime = 30
  const [filterTime, setFilterTime] = useState(defaultFilterTime)

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('daysAhead')) {
      setFilterTime(searchParams.get('daysAhead'))
    }
  }, [searchParams])

  // This is the function that is called when the user changes the number of days to show in the birthday list
  const handleBirthdaySubmit = (e) => {
    e.preventDefault()
  }

  const resetFilter = (e) => {
    setFilterTime(0)
  }

    return (
      <Routes>
        <Route path="/" element={<Navigate to={'/dashboard/overview'} />} />
        <Route
          path="/dashboard/*"
          element={
            <Dashboard
              setFilterTime={(value) => setFilterTime(value)}
              filterTime={filterTime}
              //applyFilter={(e) => applyFilter(e)}
              setBirthdayLength={(length) => setBirthdayLength(length)}
              birthdayLength={birthdayLength}
              handleBirthdaySubmit={(e) => handleBirthdaySubmit(e)}
              resetFilter={(e) => resetFilter(e)}
            />}
        />
        <Route
          path="*"
          element={
            <NotFoundPage />}
        />
      </Routes>
    )
}