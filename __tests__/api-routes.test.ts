import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/tasks/route'
import { GET as getTask, PATCH, DELETE } from '@/app/api/tasks/[id]/route'

// Helper to extract JSON from NextResponse
async function getJson(res: any) {
    if (typeof res.json === 'function') return res.json();
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

describe('API Routes', () => {
    const mockTasks = [
        { id: 1, userId: 1, title: 'Test Task 1', completed: false },
        { id: 2, userId: 1, title: 'Test Task 2', completed: true },
    ]

    beforeEach(() => {
        // Reset global tasks array
        global.tasks = []
    })

    describe('GET /api/tasks', () => {
        it('should return empty array when no tasks exist', async () => {
            const request = new NextRequest('http://localhost:3000/api/tasks')
            const response = await GET(request)
            const data = await getJson(response)

            expect(response.status).toBe(200)
            expect(data).toEqual([])
        })

        it('should return all tasks', async () => {
            global.tasks = [...mockTasks]
            const request = new NextRequest('http://localhost:3000/api/tasks')
            const response = await GET(request)
            const data = await getJson(response)

            expect(response.status).toBe(200)
            expect(data).toEqual(mockTasks)
        })
    })

    describe('POST /api/tasks', () => {
        it('should create a new task', async () => {
            const newTask = { title: 'New Task', userId: 1 }
            const request = new NextRequest('http://localhost:3000/api/tasks', {
                method: 'POST',
                body: JSON.stringify(newTask),
            })

            const response = await POST(request)
            const data = await getJson(response)

            expect(response.status).toBe(201)
            expect(data).toMatchObject({
                id: expect.any(Number),
                ...newTask,
                completed: false,
            })
            expect(global.tasks).toHaveLength(1)
        })

        it('should validate task data', async () => {
            const invalidTask = { title: '' } // Missing required fields
            const request = new NextRequest('http://localhost:3000/api/tasks', {
                method: 'POST',
                body: JSON.stringify(invalidTask),
            })

            const response = await POST(request)
            expect(response.status).toBe(400)
            expect(global.tasks).toHaveLength(0)
        })
    })

    describe('GET /api/tasks/[id]', () => {
        it('should return task by id', async () => {
            global.tasks = [...mockTasks]
            const request = new NextRequest('http://localhost:3000/api/tasks/1')
            const response = await getTask(request, { params: { id: '1' } })
            const data = await getJson(response)

            expect(response.status).toBe(200)
            expect(data).toEqual(mockTasks[0])
        })

        it('should return 404 for non-existent task', async () => {
            const request = new NextRequest('http://localhost:3000/api/tasks/999')
            const response = await getTask(request, { params: { id: '999' } })

            expect(response.status).toBe(404)
        })
    })

    describe('PATCH /api/tasks/[id]', () => {
        it('should update task', async () => {
            global.tasks = [...mockTasks]
            const updates = { title: 'Updated Task', completed: true }
            const request = new NextRequest('http://localhost:3000/api/tasks/1', {
                method: 'PATCH',
                body: JSON.stringify(updates),
            })

            const response = await PATCH(request, { params: { id: '1' } })
            const data = await getJson(response)

            expect(response.status).toBe(200)
            expect(data).toEqual({
                ...mockTasks[0],
                ...updates,
            })
            expect(global.tasks[0]).toEqual({
                ...mockTasks[0],
                ...updates,
            })
        })

        it('should return 404 for non-existent task', async () => {
            const request = new NextRequest('http://localhost:3000/api/tasks/999', {
                method: 'PATCH',
                body: JSON.stringify({ title: 'Updated Task' }),
            })

            const response = await PATCH(request, { params: { id: '999' } })
            expect(response.status).toBe(404)
        })

        it('should validate update data', async () => {
            global.tasks = [...mockTasks]
            const invalidUpdate = { title: '' } // Invalid title
            const request = new NextRequest('http://localhost:3000/api/tasks/1', {
                method: 'PATCH',
                body: JSON.stringify(invalidUpdate),
            })

            const response = await PATCH(request, { params: { id: '1' } })
            expect(response.status).toBe(400)
            expect(global.tasks[0]).toEqual(mockTasks[0]) // Task unchanged
        })
    })

    describe('DELETE /api/tasks/[id]', () => {
        it('should delete task', async () => {
            global.tasks = [...mockTasks]
            const request = new NextRequest('http://localhost:3000/api/tasks/1', {
                method: 'DELETE',
            })

            const response = await DELETE(request, { params: { id: '1' } })
            expect(response.status).toBe(204)
            expect(global.tasks).toHaveLength(1)
            expect(global.tasks.find(t => t.id === 1)).toBeUndefined()
        })

        it('should return 404 for non-existent task', async () => {
            const request = new NextRequest('http://localhost:3000/api/tasks/999', {
                method: 'DELETE',
            })

            const response = await DELETE(request, { params: { id: '999' } })
            expect(response.status).toBe(404)
        })
    })
}) 