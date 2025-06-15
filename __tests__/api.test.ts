import { fetchTasks, fetchUsers, fetchTasksWithUsers } from '@/lib/api'
import type { Task, User } from '@/lib/types'
import { renderHook, act } from '@testing-library/react'
import { useTasks, useUsers, createTask, updateTask, deleteTask } from '@/lib/api'
import { SWRConfig } from 'swr'

describe('API Functions', () => {
    const mockTasks: Task[] = [
        { id: 1, userId: 1, title: 'Test Task 1', completed: false },
        { id: 2, userId: 1, title: 'Test Task 2', completed: true },
    ]

    const mockUsers: User[] = [
        { id: 1, name: 'Test User 1', email: 'test1@example.com' },
        { id: 2, name: 'Test User 2', email: 'test2@example.com' },
    ]

    beforeEach(() => {
        // Reset fetch mock
        (global.fetch as jest.Mock).mockClear()
    })

    describe('fetchTasks', () => {
        it('should fetch tasks successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockTasks),
            })

            const tasks = await fetchTasks()
            expect(tasks).toEqual(mockTasks)
            expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/todos?_limit=200')
        })

        it('should throw error on failed fetch', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            })

            await expect(fetchTasks()).rejects.toThrow('Failed to fetch tasks')
        })
    })

    describe('fetchUsers', () => {
        it('should fetch users successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUsers),
            })

            const users = await fetchUsers()
            expect(users).toEqual(mockUsers)
            expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users')
        })

        it('should throw error on failed fetch', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            })

            await expect(fetchUsers()).rejects.toThrow('Failed to fetch users')
        })
    })

    describe('fetchTasksWithUsers', () => {
        it('should fetch both tasks and users successfully', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockTasks),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockUsers),
                })

            const result = await fetchTasksWithUsers()
            expect(result).toEqual({
                tasks: mockTasks,
                users: mockUsers,
            })
            expect(global.fetch).toHaveBeenCalledTimes(2)
        })

        it('should throw error if tasks fetch fails', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            })

            await expect(fetchTasksWithUsers()).rejects.toThrow('Failed to fetch tasks')
        })

        it('should throw error if users fetch fails', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockTasks),
                })
                .mockResolvedValueOnce({
                    ok: false,
                })

            await expect(fetchTasksWithUsers()).rejects.toThrow('Failed to fetch users')
        })
    })
})

describe('SWR Data Management', () => {
    const mockTasks: Task[] = [
        { id: 1, userId: 1, title: 'Test Task 1', completed: false },
        { id: 2, userId: 1, title: 'Test Task 2', completed: true }
    ]

    const mockUsers: User[] = [
        {
            id: 1,
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            address: {
                street: 'Test St',
                suite: 'Test Suite',
                city: 'Test City',
                zipcode: '12345',
                geo: { lat: '0', lng: '0' }
            },
            phone: '123-456-7890',
            website: 'test.com',
            company: {
                name: 'Test Co',
                catchPhrase: 'Test Phrase',
                bs: 'Test BS'
            }
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
            // Mock successful API responses
            ; (global.fetch as jest.Mock).mockImplementation((url) => {
                if (url.includes('/api/tasks')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockTasks)
                    })
                }
                if (url.includes('/api/users')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockUsers)
                    })
                }
                return Promise.reject(new Error('Not found'))
            })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SWRConfig value= {{ provider: () => new Map()
}}>
{ children }
</SWRConfig>
)

describe('useTasks', () => {
    it('should fetch and cache tasks', async () => {
        const { result } = renderHook(() => useTasks(), { wrapper })

        // Initial state should be loading
        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        // Wait for data to load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        // Data should be loaded and cached
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual(mockTasks)
        expect(result.current.error).toBeUndefined()

        // Second render should use cached data
        const { result: result2 } = renderHook(() => useTasks(), { wrapper })
        expect(result2.current.isLoading).toBe(false)
        expect(result2.current.data).toEqual(mockTasks)
    })

    it('should handle task creation', async () => {
        const newTask: Omit<Task, 'id'> = {
            userId: 1,
            title: 'New Task',
            completed: false
        }

            // Mock successful task creation
            ; (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
                if (url.includes('/api/tasks') && options?.method === 'POST') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ id: 3, ...newTask })
                    })
                }
                return Promise.reject(new Error('Not found'))
            })

        const { result } = renderHook(() => useTasks(), { wrapper })

        // Wait for initial data load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        // Create new task
        await act(async () => {
            await createTask(newTask)
        })

        // Data should be updated with new task
        expect(result.current.data).toHaveLength(3)
        expect(result.current.data?.[0]).toEqual({ id: 3, ...newTask })
    })

    it('should handle task updates', async () => {
        const updates = { title: 'Updated Task', completed: true }

            // Mock successful task update
            ; (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
                if (url.includes('/api/tasks/1') && options?.method === 'PATCH') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ ...mockTasks[0], ...updates })
                    })
                }
                return Promise.reject(new Error('Not found'))
            })

        const { result } = renderHook(() => useTasks(), { wrapper })

        // Wait for initial data load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        // Update task
        await act(async () => {
            await updateTask(1, updates)
        })

        // Data should be updated
        expect(result.current.data?.[0]).toEqual({ ...mockTasks[0], ...updates })
    })

    it('should handle task deletion', async () => {
        // Mock successful task deletion
        ; (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
            if (url.includes('/api/tasks/1') && options?.method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    status: 204
                })
            }
            return Promise.reject(new Error('Not found'))
        })

        const { result } = renderHook(() => useTasks(), { wrapper })

        // Wait for initial data load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        // Delete task
        await act(async () => {
            await deleteTask(1)
        })

        // Data should be updated
        expect(result.current.data).toHaveLength(1)
        expect(result.current.data?.[0].id).toBe(2)
    })
})

describe('useUsers', () => {
    it('should fetch and cache users', async () => {
        const { result } = renderHook(() => useUsers(), { wrapper })

        // Initial state should be loading
        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        // Wait for data to load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        // Data should be loaded and cached
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual(mockUsers)
        expect(result.current.error).toBeUndefined()

        // Second render should use cached data
        const { result: result2 } = renderHook(() => useUsers(), { wrapper })
        expect(result2.current.isLoading).toBe(false)
        expect(result2.current.data).toEqual(mockUsers)
    })
})
}) 