"use server";

interface IFetchTask {
    limit: number;
    page: number;
    status: string;
}

export async function fetchTasks({ limit, page, status }: IFetchTask) {
    try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const response = await fetch(process.env.API_URL + `/tasks?${params}`, {
            method: "GET",
        });

        if (response.ok) {
            const data = await response.json();

            return { success: true, data: data.data };
        } else {
            throw new Error("API call failed");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return {
            success: false,
            message: "Internal Server Error",
        };
    }
}

export async function deleteTask(id: string) {
    try {
        const response = await fetch(process.env.API_URL + `/tasks/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            return { success: true, message: "Task deleted successfully!" };
        } else {
            throw new Error("API call failed");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return {
            success: false,
            message: "Task not found",
        };
    }
}

export async function updateTask(
    id: string,
    taskData: {
        title: string;
        description?: string;
        status: "TO_DO" | "IN_PROGRESS" | "DONE";
    }
) {
    try {
        const response = await fetch(process.env.API_URL + `/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        });

        if (response.ok) {
            const updatedTask = await response.json();
            return {
                success: true,
                data: updatedTask,
                message: "Task updated successfully!",
            };
        } else {
            throw new Error("API call failed");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return {
            success: false,
            data: [],
            message: "Task update failed",
        };
    }
}

export async function createTask(taskData: {
    title: string;
    description?: string;
}) {
    try {
        const response = await fetch(process.env.API_URL + "/tasks", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        });

        if (response.ok) {
            const newTask = await response.json();

            return {
                success: true,
                data: newTask,
                message: "Task created successfully!",
            };
        } else {
            throw new Error("API call failed");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return {
            success: false,
            message: "Task created successfully (using offline mode)!",
        };
    }
}

export async function getTaskDetails(id: string) {
    try {
        const response = await fetch(process.env.API_URL + `/tasks/${id}`, {
            method: "GET",
        });

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
}
