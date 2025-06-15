import { useTaskStore } from '@/lib/store'
import { fetchTasksWithUsers } from '@/lib/api'
import { createTaskAction, updateTaskAction, deleteTaskAction } from '@/lib/actions'
import { Task, User, TaskFilters } from '@/lib/types'

jest.mock('@/lib/api', () => ({
    fetchTasksWithUsers: jest.fn(),
}))
jest.mock('@/lib/actions', () => ({
    createTaskAction: jest.fn(),
    updateTaskAction: jest.fn(),
    deleteTaskAction: jest.fn(),
}))

describe('Task Store', () => {
    const mockTasks: Task[] = [
        { id: 1, userId: 1, title: 'Test Task 1', completed: false },
        { id: 2, userId: 1, title: 'Test Task 2', completed: true },
    ]
    const mockUsers: User[] = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        // Reset the store state (using getState and setState) before each test
        const store = useTaskStore.getState()
        useTaskStore.setState({ tasks: [], users: [], loading: false, error: null, initialized: false, filters: { assignee: 'all' }, filteredTasks: [] })
    })

    describe('initialize', () => {
        it('should initialize store with tasks and users', async () => {
            (fetchTasksWithUsers as jest.Mock).mockResolvedValue({ tasks: mockTasks, users: mockUsers })
            await useTaskStore.getState().initialize()
            const state = useTaskStore.getState()
            expect(state.tasks).toEqual(mockTasks)
            expect(state.users).toEqual(mockUsers)
            expect(state.initialized).toBe(true)
        })

        it('should handle initialization error', async () => {
            (fetchTasksWithUsers as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))
            await useTaskStore.getState().initialize()
            const state = useTaskStore.getState()
            expect(state.error).toBe('Failed to fetch')
            expect(state.initialized).toBe(false)
        })
    })

    describe('task operations', () => {
        describe('createTask', () => {
            it('should create a new task', async () => {
                (createTaskAction as jest.Mock).mockResolvedValue({ success: true, task: { id: 3, userId: 1, title: 'New Task', completed: false } })
                const newTaskData: Omit<Task, 'id'> = { userId: 1, title: 'New Task', completed: false }
                await useTaskStore.getState().createTask(newTaskData)
                const state = useTaskStore.getState()
                expect(state.tasks).toHaveLength(1)
                expect(state.tasks[0]).toMatchObject({ id: 3, title: 'New Task' })
            })

            it('should handle task creation error', async () => {
                (createTaskAction as jest.Mock).mockRejectedValue(new Error('Failed to create'))
                const newTaskData: Omit<Task, 'id'> = { userId: 1, title: 'New Task', completed: false }
                await expect(useTaskStore.getState().createTask(newTaskData)).rejects.toThrow('Failed to create')
                const state = useTaskStore.getState()
                expect(state.error).toBe('Failed to create')
            })
        })

        describe('updateTask', () => {
            it('should update an existing task', async () => {
                (updateTaskAction as jest.Mock).mockResolvedValue({ success: true, task: { id: 1, userId: 1, title: 'Updated Task', completed: true } })
                    (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
                await useTaskStore.getState().updateTask(1, { title: 'Updated Task', completed: true })
                const state = useTaskStore.getState()
                const updated = state.tasks.find(t => t.id === 1)
                expect(updated).toMatchObject({ id: 1, title: 'Updated Task', completed: true })
            })

            it('should handle task update error', async () => {
                (updateTaskAction as jest.Mock).mockRejectedValue(new Error('Failed to update'))
                    (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
                await expect(useTaskStore.getState().updateTask(1, { title: 'Updated Task' })).rejects.toThrow('Failed to update')
                const state = useTaskStore.getState()
                expect(state.error).toBe('Failed to update')
            })
        })

        describe('deleteTask', () => {
            it('should delete an existing task', async () => {
                (deleteTaskAction as jest.Mock).mockResolvedValue({ success: true })
                    (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
                await useTaskStore.getState().deleteTask(1)
                const state = useTaskStore.getState()
                expect(state.tasks).toHaveLength(1)
                expect(state.tasks.find(t => t.id === 1)).toBeUndefined()
            })

            it('should handle task deletion error', async () => {
                (deleteTaskAction as jest.Mock).mockRejectedValue(new Error('Failed to delete'))
                    (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
                await expect(useTaskStore.getState().deleteTask(1)).rejects.toThrow('Failed to delete')
                const state = useTaskStore.getState()
                expect(state.error).toBe('Failed to delete')
            })
        })
    })

    describe('filtering', () => {
        it('should filter tasks by status', () => {
            (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
            useTaskStore.getState().setFilters({ assignee: 'all', status: 'completed' })
            useTaskStore.getState().applyFilters()
            const state = useTaskStore.getState()
            expect(state.filteredTasks).toHaveLength(1)
            expect(state.filteredTasks[0].completed).toBe(true)
        })

        it('should filter tasks by search term', () => {
            (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
            useTaskStore.getState().setFilters({ assignee: 'all', search: 'Test Task 1' })
            useTaskStore.getState().applyFilters()
            const state = useTaskStore.getState()
            expect(state.filteredTasks).toHaveLength(1)
            expect(state.filteredTasks[0].title).toBe('Test Task 1')
        })

        it('should filter tasks by assignee', () => {
            (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
            useTaskStore.getState().setFilters({ assignee: '1' })
            useTaskStore.getState().applyFilters()
            const state = useTaskStore.getState()
            expect(state.filteredTasks).toHaveLength(2)
        })

        it('should combine multiple filters', () => {
            (useTaskStore.getState().tasks as Task[]) = [...mockTasks]
            useTaskStore.getState().setFilters({ assignee: '1', status: 'completed', search: 'Test Task 2' })
            useTaskStore.getState().applyFilters()
            const state = useTaskStore.getState()
            expect(state.filteredTasks).toHaveLength(1)
            expect(state.filteredTasks[0].title).toBe('Test Task 2')
        })
    })
}) 