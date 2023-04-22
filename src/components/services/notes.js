import axios from 'axios'
const baseUrl = '/api/notes'

let token = null

const setToken = newToken => {
  token = `bearer ${newToken}`
}

const getAll = () => {
  return axios.get(baseUrl).then(responce => responce.data)
}

const create = async newObject => {
  const config = {
    headers: { Authorization: token },
  }
  const res = await axios.post(baseUrl, newObject, config)
  return res.data
}

const update = (id, newObject) => {
  return axios.put(`${baseUrl}/${id}`, newObject).then(responce => responce.data)
}

const remove = id => {
  return axios.delete(`${baseUrl}/${id}`).then(responce => responce.data)
}

export default {
  getAll,
  create,
  update,
  remove,
  setToken
}