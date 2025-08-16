"use client";

export function useTaskOperations() {
    const getTask = async (taskId: string) => {
        try {
            const response = await fetch(
                `http://localhost:3005/tasks/${taskId}`,
                {
                    method: "GET",
                }
            );

            if (response.ok) {
                const task = await response.json();
                return {
                    success: true,
                    data: task,
                };
            } else {
                throw new Error("API call failed");
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return {
                success: false,
                data: [],
                message: "Task not found",
            };
        }
    };

    return {
        getTask,
    };
}
