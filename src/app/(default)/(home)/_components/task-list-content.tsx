"use client";

import { Task } from "@/types/task";
import React, { useCallback, useEffect, useState } from "react";
import {
    Trash2,
    Edit3,
    Plus,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteTask, fetchTasks } from "../actions";

const statusOptions = [
    { value: "", label: "All Tasks" },
    { value: "TO_DO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
];

export default function TaskListContent() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const router = useRouter();

    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        taskId: string | null;
        taskTitle: string;
    }>({
        show: false,
        taskId: null,
        taskTitle: "",
    });

    const limit = 10;

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await fetchTasks({
                page: currentPage,
                limit,
                status: statusFilter,
            });

            if (result.success) {
                setTasks(result.data || []);
                setTotalPages(result.data.totalPages || 1);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Failed to load tasks");
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter]);

    const handleDeleteTask = async (taskId: string | null) => {
        if (!taskId) return;
        setLoading(true);
        try {
            const result = await deleteTask(taskId);

            if (result.success) {
                setTasks(tasks.filter((task) => task.id !== taskId));
                setDeleteModal({ show: false, taskId: null, taskTitle: "" });

                if (result.message.includes("offline")) {
                    toast.success(result.message);
                } else {
                    toast.success(result.message);
                }
            } else {
                toast.error("Failed to delete task");
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to delete task");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "TO_DO":
                return "bg-gray-100 text-gray-800 border-gray-300";
            case "IN_PROGRESS":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "DONE":
                return "bg-green-100 text-green-800 border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const formatStatus = (status: string) => {
        return status
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleCreateTask = () => {
        router.push("/tasks");
    };
    const handleEditTask = (id: string) => {
        router.push(`/tasks/edit/${id}`);
    };

    useEffect(() => {
        loadTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, statusFilter]);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and track your tasks
                    </p>
                </div>
                <button
                    onClick={handleCreateTask}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add New Task
                </button>
            </div>

            <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 text-gray-700 font-medium">
                        Filter by status:
                    </label>
                    <div className="flex gap-2">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() =>
                                    handleStatusFilterChange(option.value)
                                }
                                className={`px-4 py-2 rounded-lg border transition-colors ${
                                    statusFilter === option.value
                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {error && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">{error}</p>
                </div>
            )}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
            {!loading && (
                <div className="space-y-4">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">
                                No tasks found
                            </p>
                            <p className="text-gray-400 mt-1">
                                Create a new task to get started
                            </p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {task.title}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(
                                                    task.status
                                                )}`}
                                            >
                                                {formatStatus(task.status)}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p className="text-gray-600 mt-2">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() =>
                                                handleEditTask(task.id)
                                            }
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit task"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeleteModal({
                                                    show: true,
                                                    taskId: task.id,
                                                    taskTitle: task.title,
                                                })
                                            }
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete task"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!loading && tasks.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 rounded-lg ${
                                    currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Delete Task
                                </h3>
                                <p className="text-gray-600">
                                    Are you sure you want to delete &quot;
                                    {deleteModal.taskTitle}&quot;?
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        taskId: null,
                                        taskTitle: "",
                                    })
                                }
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    handleDeleteTask(deleteModal.taskId)
                                }
                                disabled={loading}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
