"use client";
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: "TO_DO" | "IN_PROGRESS" | "DONE";
    createdAt: string;
    updatedAt: string;
}

interface MockDataContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, "id">) => Task;
    updateTask: (id: string, updates: Partial<Task>) => boolean;
    deleteTask: (id: string) => boolean;
    getTasks: (filters?: {
        status?: string;
        page?: number;
        limit?: number;
    }) => {
        tasks: Task[];
        totalPages: number;
        currentPage: number;
    };
    resetToInitialData: () => void;
}

const initialMockTasks: Task[] = [
    {
        id: "1",
        title: "Complete project proposal",
        status: "TO_DO",
        description: "Write and submit the Q4 project proposal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Review code changes",
        status: "IN_PROGRESS",
        description: "Review pull requests from team members",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        title: "Update documentation",
        status: "DONE",
        description: "Update API documentation with new endpoints",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "4",
        title: "Plan team meeting",
        status: "TO_DO",
        description: "Schedule and prepare agenda for weekly team sync",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "5",
        title: "Fix bug in authentication",
        status: "IN_PROGRESS",
        description: "Resolve login issues reported by users",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "6",
        title: "Complete project proposal",
        status: "TO_DO",
        description: "Write and submit the Q4 project proposal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "7",
        title: "Review code changes",
        status: "IN_PROGRESS",
        description: "Review pull requests from team members",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "8",
        title: "Update documentation",
        status: "DONE",
        description: "Update API documentation with new endpoints",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "9",
        title: "Plan team meeting",
        status: "TO_DO",
        description: "Schedule and prepare agenda for weekly team sync",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "10",
        title: "Fix bug in authentication",
        status: "IN_PROGRESS",
        description: "Resolve login issues reported by users",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "11",
        title: "Fix bug in authentication",
        status: "IN_PROGRESS",
        description: "Resolve login issues reported by users",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const MockDataContext = createContext<MockDataContextType | undefined>(
    undefined
);

export function MockDataProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(initialMockTasks);
    const [nextId, setNextId] = useState<string>("12");

    const addTask = useCallback(
        (newTask: Omit<Task, "id">): Task => {
            const task: Task = {
                ...newTask,
                id: nextId,
                status: newTask.status || "TO_DO",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setTasks((prevTasks) => [...prevTasks, task]);
            setNextId((prevId) => prevId + 1);

            return task;
        },
        [nextId]
    );

    const updateTask = useCallback(
        (id: string, updates: Partial<Task>): boolean => {
            setTasks((prevTasks) => {
                const taskIndex = prevTasks.findIndex((task) => task.id === id);
                if (taskIndex === -1) return prevTasks;

                const updatedTasks = [...prevTasks];
                updatedTasks[taskIndex] = {
                    ...updatedTasks[taskIndex],
                    ...updates,
                    updatedAt: new Date().toISOString(),
                };
                return updatedTasks;
            });
            return true;
        },
        []
    );

    const deleteTask = useCallback((id: string): boolean => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        return true;
    }, []);

    const getTasks = useCallback(
        (filters?: { status?: string; page?: number; limit?: number }) => {
            const { status, page = 1, limit = 10 } = filters || {};

            let filteredTasks = tasks;

            // Apply status filter
            if (status && status !== "") {
                filteredTasks = tasks.filter((task) => task.status === status);
            }

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

            return {
                tasks: paginatedTasks,
                totalPages: Math.ceil(filteredTasks.length / limit),
                currentPage: page,
            };
        },
        [tasks]
    );

    const resetToInitialData = useCallback(() => {
        setTasks(initialMockTasks);
        setNextId("12");
    }, []);

    const value: MockDataContextType = {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getTasks,
        resetToInitialData,
    };

    return (
        <MockDataContext.Provider value={value}>
            {children}
        </MockDataContext.Provider>
    );
}

export function useMockData(): MockDataContextType {
    const context = useContext(MockDataContext);
    if (context === undefined) {
        throw new Error("useMockData must be used within a MockDataProvider");
    }
    return context;
}
