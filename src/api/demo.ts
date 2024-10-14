import { api } from '@/api/axiosWrapper'
import { type TokenPair, useAuthStore } from '@/stores/auth'

// Make requests
api
  .get('/users', {
    page: 1,
    size: 20,
    sort: {
      email: 'asc',
      last_modify: 'desc',
      name: 'asc',
    },
  })
  .then((response) => console.log(response.data))
  .catch((error) => console.error(error))

api
  .post('/users', { name: 'John Doe', email: 'john@example.com' })
  .then((response) => console.log(response.data))
  .catch((error) => console.error(error))

async function login(username: string, password: string): Promise<void> {
  const response = await api.post<TokenPair>('/auth/login', { username, password })
  const authStore = useAuthStore()
  authStore.setTokenPair(response.data)
}
