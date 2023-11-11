export const formatExcludedRoles = async (fetchedRoles, trainingToFormat, selectedExcludedRoles) => {
    trainingToFormat.excludedRoles = fetchedRoles.filter(role => {
        return selectedExcludedRoles.includes(role.name)
    })

    trainingToFormat.excludedRoles = trainingToFormat.excludedRoles.map(role => {
        return {
            roleId: role._id,
            name: role.name
        }
    })
    return trainingToFormat
}