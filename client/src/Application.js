import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './pages/dashboard/Dashboard'
import { NotFoundPage } from './pages/NotFoundPage';

export function Application() {

  const [birthdayLength, setBirthdayLength] = useState(31)
  const [filterTime, setFilterTime] = useState(30)

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