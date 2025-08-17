import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchTasks, deleteTask } from "../actions";
import { Task } from "@/types/task";
import TaskListContent from "./task-list-content";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("../actions", () => ({
    fetchTasks: jest.fn(),
    deleteTask: jest.fn(),
}));

const mockRouterPush = jest.fn();
const mockFetchTasks = fetchTasks as jest.MockedFunction<typeof fetchTasks>;
const mockDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>;

// Mock data
const mockTasks: Task[] = [
    {
        id: "1",
        title: "Test Task 1",
        description: "Description for task 1",
        status: "TO_DO",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Test Task 2",
        description: "Description for task 2",
        status: "IN_PROGRESS",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        title: "Test Task 3",
        description: "Description for task 3",
        status: "DONE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const mockTasksResponse = {
    success: true,
    data: {
        data: mockTasks,
        totalPages: 1,
        currentPage: 1,
        total: 3,
    },
};

// Helper function to render component with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe("TaskListContent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Rendering", () => {
        it("renders the main heading and description", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            expect(screen.getByText("Tasks")).toBeInTheDocument();
            expect(
                screen.getByText("Manage and track your tasks")
            ).toBeInTheDocument();
        });

        it("renders the Add New Task button", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            const addButton = screen.getByRole("button", {
                name: /add new task/i,
            });
            expect(addButton).toBeInTheDocument();
        });

        it("renders status filter buttons", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            expect(screen.getByText("Filter by status:")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "All Tasks" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "To Do" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "In Progress" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Done" })
            ).toBeInTheDocument();
        });
    });

    describe("Loading State", () => {
        it("shows loading spinner when data is loading", () => {
            mockFetchTasks.mockImplementation(() => new Promise(() => {})); // Never resolves

            renderWithQueryClient(<TaskListContent />);

            expect(
                screen.getByTestId("loading-spinner") ||
                    screen.getByRole("status")
            ).toBeInTheDocument();
        });
    });

    describe("Task Display", () => {
        it("displays tasks when data is loaded", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                expect(screen.getByText("Test Task 1")).toBeInTheDocument();
                expect(screen.getByText("Test Task 2")).toBeInTheDocument();
                expect(screen.getByText("Test Task 3")).toBeInTheDocument();
            });
        });

        it("displays task descriptions", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                expect(
                    screen.getByText("Description for task 1")
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Description for task 2")
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Description for task 3")
                ).toBeInTheDocument();
            });
        });

        it("displays correct status badges", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                expect(screen.getByText("To Do")).toBeInTheDocument();
                expect(screen.getByText("In Progress")).toBeInTheDocument();
                expect(screen.getByText("Done")).toBeInTheDocument();
            });
        });

        it("shows empty state when no tasks are found", async () => {
            mockFetchTasks.mockResolvedValueOnce({
                success: true,
                data: {
                    data: [],
                    totalPages: 0,
                    currentPage: 1,
                    total: 0,
                },
            });

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                expect(screen.getByText("No tasks found")).toBeInTheDocument();
                expect(
                    screen.getByText("Create a new task to get started")
                ).toBeInTheDocument();
            });
        });
    });

    describe("Navigation", () => {
        it("navigates to task creation page when Add New Task is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            const addButton = screen.getByRole("button", {
                name: /add new task/i,
            });
            fireEvent.click(addButton);

            expect(mockRouterPush).toHaveBeenCalledWith("/tasks");
        });

        it("navigates to edit page when edit button is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const editButtons = screen.getAllByTitle("Edit task");
                fireEvent.click(editButtons[0]);

                expect(mockRouterPush).toHaveBeenCalledWith("/tasks/edit/1");
            });
        });
    });

    describe("Status Filtering", () => {
        it("applies status filter when filter button is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            const toDoFilter = screen.getByRole("button", { name: "To Do" });
            fireEvent.click(toDoFilter);

            await waitFor(() => {
                expect(mockFetchTasks).toHaveBeenCalledWith({
                    page: 1,
                    limit: 10,
                    status: "TO_DO",
                });
            });
        });

        it("highlights active filter button", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            const toDoFilter = screen.getByRole("button", { name: "To Do" });
            fireEvent.click(toDoFilter);

            expect(toDoFilter).toHaveClass(
                "bg-blue-100",
                "text-blue-700",
                "border-blue-300"
            );
        });

        it("resets to page 1 when filter is changed", async () => {
            mockFetchTasks.mockResolvedValueOnce({
                success: false,
                message: "Failed to fetch",
            });

            renderWithQueryClient(<TaskListContent />);

            // Wait for initial load, then change page
            await waitFor(() => {
                const nextButton = screen.getByRole("button", {
                    name: /next/i,
                });
                fireEvent.click(nextButton);
            });

            // Then apply filter
            const toDoFilter = screen.getByRole("button", { name: "To Do" });
            fireEvent.click(toDoFilter);

            await waitFor(() => {
                expect(mockFetchTasks).toHaveBeenLastCalledWith({
                    page: 1, // Should reset to page 1
                    limit: 10,
                    status: "TO_DO",
                });
            });
        });
    });

    describe("Pagination", () => {
        const mockPaginatedResponse = {
            success: true,
            data: mockTasks,
            totalPages: 3,
            currentPage: 1,
            total: 30,
        };

        it("renders pagination when there are multiple pages", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockPaginatedResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                expect(
                    screen.getByRole("button", { name: /previous/i })
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("button", { name: /next/i })
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("button", { name: "1" })
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("button", { name: "2" })
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("button", { name: "3" })
                ).toBeInTheDocument();
            });
        });

        it("disables Previous button on first page", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockPaginatedResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const prevButton = screen.getByRole("button", {
                    name: /previous/i,
                });
                expect(prevButton).toBeDisabled();
            });
        });

        it("navigates to next page when Next button is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockPaginatedResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const nextButton = screen.getByRole("button", {
                    name: /next/i,
                });
                fireEvent.click(nextButton);

                expect(mockFetchTasks).toHaveBeenCalledWith({
                    page: 2,
                    limit: 10,
                    status: "",
                });
            });
        });

        it("navigates to specific page when page number is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockPaginatedResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const pageButton = screen.getByRole("button", { name: "3" });
                fireEvent.click(pageButton);

                expect(mockFetchTasks).toHaveBeenCalledWith({
                    page: 3,
                    limit: 10,
                    status: "",
                });
            });
        });
    });

    describe("Task Deletion", () => {
        it("opens delete modal when delete button is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle("Delete task");
                fireEvent.click(deleteButtons[0]);

                expect(screen.getByText("Delete Task")).toBeInTheDocument();
                expect(
                    screen.getByText(/are you sure you want to delete/i)
                ).toBeInTheDocument();
                expect(screen.getByText('"Test Task 1"')).toBeInTheDocument();
            });
        });

        it("closes delete modal when Cancel is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle("Delete task");
                fireEvent.click(deleteButtons[0]);
            });

            const cancelButton = screen.getByRole("button", { name: "Cancel" });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(
                    screen.queryByText("Delete Task")
                ).not.toBeInTheDocument();
            });
        });

        it("deletes task when Delete button is clicked", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);
            mockDeleteTask.mockResolvedValueOnce({
                success: true,
                message: "Task deleted successfully",
            });

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle("Delete task");
                fireEvent.click(deleteButtons[0]);
            });

            const deleteButton = screen.getByRole("button", { name: "Delete" });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockDeleteTask).toHaveBeenCalledWith("1");
                expect(toast.success).toHaveBeenCalledWith(
                    "Task deleted successfully"
                );
            });
        });

        it("shows error toast when deletion fails", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);
            mockDeleteTask.mockResolvedValueOnce({
                success: false,
                message: "Error deleting task",
            });

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle("Delete task");
                fireEvent.click(deleteButtons[0]);
            });

            const deleteButton = screen.getByRole("button", { name: "Delete" });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    "Failed to delete task"
                );
            });
        });

        it("shows loading state during deletion", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);
            mockDeleteTask.mockImplementation(() => new Promise(() => {})); // Never resolves

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle("Delete task");
                fireEvent.click(deleteButtons[0]);
            });

            const deleteButton = screen.getByRole("button", { name: "Delete" });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(screen.getByText("Deleting...")).toBeInTheDocument();
                expect(deleteButton).toBeDisabled();
            });
        });
    });

    describe("Error Handling", () => {
        it("shows error message when tasks fail to load", async () => {
            mockFetchTasks.mockRejectedValueOnce(new Error("Failed to fetch"));

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to load tasks")
                ).toBeInTheDocument();
            });
        });
    });

    describe("Status Badge Colors", () => {
        it("applies correct CSS classes for different status badges", async () => {
            mockFetchTasks.mockResolvedValueOnce(mockTasksResponse);

            renderWithQueryClient(<TaskListContent />);

            await waitFor(() => {
                const todoBadge = screen.getByText("To Do");
                const inProgressBadge = screen.getByText("In Progress");
                const doneBadge = screen.getByText("Done");

                expect(todoBadge).toHaveClass(
                    "bg-gray-100",
                    "text-gray-800",
                    "border-gray-300"
                );
                expect(inProgressBadge).toHaveClass(
                    "bg-blue-100",
                    "text-blue-800",
                    "border-blue-300"
                );
                expect(doneBadge).toHaveClass(
                    "bg-green-100",
                    "text-green-800",
                    "border-green-300"
                );
            });
        });
    });
});
