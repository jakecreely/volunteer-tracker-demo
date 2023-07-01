import axios from 'axios'

export const getProtected = async (url) => {
    const request = await axios.get(process.env.REACT_APP_BASE_URL + url).then(res => {
        return (res.data)
    }).catch(err => {
        console.log(err)
        return null
    })
    return request
}

export const postProtected = async (url, data) => {
    const request = await axios.post(process.env.REACT_APP_BASE_URL + url, data).then(res => {
        return (res.data)
    }).catch(err => {
        console.log(err)
        return null
    })
    return request
}

export const putProtected = async (url, data) => {
    const request = await axios.put(process.env.REACT_APP_BASE_URL + url, data).then(res => {
        return (res.data)
    }).catch(err => {
        console.log(err)
        return null
    })
    return request
}

export const deleteProtected = async (url) => {
    const request = await axios.delete(process.env.REACT_APP_BASE_URL + url).then(res => {
        return (res.data)
    }).catch(err => {
        console.log(err)
        return null
    })
    return request
}
