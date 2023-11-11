import React, { useEffect, useState } from "react";
import { useGetRolesQuery, useGetVolunteersQuery } from "../../../lib/apiSlice";
import { ContentLayout } from "../../../components/ContentLayout";
import { FilterVolunteers } from "../components/FilterVolunteers";
import { VolunteersList } from "../components/VolunteersList";

export function Volunteers() {
    const [selectedRoles, setSelectedRoles] = useState([])
    const [nameInput, setNameInput] = useState('')
    const [showArchived, setShowArchived] = useState(false)
    const [filteredVolunteerData, setFilteredVolunteerData] = useState([])

    const {
        data: volunteers,
        isLoading: fetchingVolunteers,
        isSuccess: volunteersSuccess,
        isError: volunteersFailed,
        error: volunteersErrorData
    } = useGetVolunteersQuery()

    const {
        data: roles,
        isLoading: fetchingRoles,
        isSuccess: rolesSuccess,
        isError: rolesFailed,
        error: rolesErrorData
    } = useGetRolesQuery()

    useEffect(() => {
        // Once both queries are successful, set filtered data to all data
        if (volunteersSuccess && rolesSuccess) {
            setFilteredVolunteerData(volunteers)
            handleFilter([], '', false)
        }
    }, [volunteersSuccess, rolesSuccess])

    const handleFilter = (selectedRoles, nameInput, showArchived) => {
        const filterRoles = async (volunteers) => {
            //If no roles selected, return all data
            if (selectedRoles.length === 0) {
                return volunteers
                //If roles selected, filter data by roles
            } else {
                // Filter volunteers by selected roles
                const filteredVolunteers = volunteers.filter(volunteer => {
                    // Check if any of the volunteer's roles match the selected roles
                    return volunteer.roles.some(role => selectedRoles.includes(role.name));
                });
                return filteredVolunteers;
            }
        }

        const filterName = async (volunteers) => {
            //If no name input, return all data
            if (nameInput === '') {
                return volunteers
                //If name input, filter data by name
            } else {
                // Filter volunteers by name input
                const filteredVolunteers = volunteers.filter(volunteer => {
                    return volunteer.name.toLowerCase().includes(nameInput.toLowerCase());
                });
                return filteredVolunteers;
            }
        }

        const filterArchive = async (volunteers) => {
            if (showArchived) {
                return volunteers
            } else {
                return volunteers.filter(volunteer => !volunteer.isArchived)
            }
        }

        //Run filter functions, so both filters are applied
        filterRoles(volunteers).then((data) => {
            filterName(data).then((data) => {
                filterArchive(data).then((filteredData) => {
                    setFilteredVolunteerData(filteredData)
                })
            })
        })
    }

    const handleNameChange = (e) => {
        handleFilter(selectedRoles, e.target.value, showArchived)
        setNameInput(e.target.value)
    }

    const handleSelectedRoles = (e) => {
        handleFilter(e.target.value, nameInput, showArchived)
        setSelectedRoles(e.target.value)
    }

    const handleArchiveChange = (e) => {
        handleFilter(selectedRoles, nameInput, e.target.checked)
        setShowArchived(e.target.checked)
    }

    const handleSubmit = ((e) => {
        e.preventDefault()
    })

    const handleReset = ((e) => {
        e.preventDefault()
        handleFilter([], '', false)
        setSelectedRoles([])
        setNameInput('')
        setShowArchived(false)
    })

    return (
        <ContentLayout>
            <FilterVolunteers
                roles={roles}
                selectedRoles={selectedRoles}
                handleSelectedRoles={(e) => handleSelectedRoles(e)}
                name={nameInput}
                showArchived={showArchived}
                handleNameChange={(e) => handleNameChange(e)}
                handleSubmit={(e) => handleSubmit(e)}
                handleReset={(e) => handleReset(e)}
                handleArchiveChange={(e) => handleArchiveChange(e)}
            />
            <VolunteersList
                volunteers={filteredVolunteerData}
                fetchingVolunteers={fetchingVolunteers}
                volunteersFailed={volunteersFailed}
                volunteersErrorData={volunteersErrorData}
                fetchingRoles={fetchingRoles}
                rolesFailed={rolesFailed}
                rolesErrorData={rolesErrorData}
            />
        </ContentLayout>
    )
}