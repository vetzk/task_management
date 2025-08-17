import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Task } from "@/types/task";

interface TaskItemProps {
    task: Task;
    onEdit: (id: string) => void;
    onDelete: (id: string, title: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
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

    const formatStatus = (status: string) => {
        return status
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            data-testid={`task-item-${task.id}`}
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
                            data-testid="status-badge"
                        >
                            {formatStatus(task.status)}
                        </span>
                    </div>
                    {task.description && (
                        <p
                            className="text-gray-600 mt-2"
                            data-testid="task-description"
                        >
                            {task.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={() => onEdit(task.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit task"
                        data-testid="edit-button"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(task.id, task.title)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete task"
                        data-testid="delete-button"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

describe("TaskItem", () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const mockTask: Task = {
        id: "1",
        title: "Test Task",
        description: "Test Description",
        status: "TO_DO",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Rendering", () => {
        it("renders task title", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByText("Test Task")).toBeInTheDocument();
        });

        it("renders task description when provided", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("task-description")).toHaveTextContent(
                "Test Description"
            );
        });

        it("does not render description element when description is empty", () => {
            const taskWithoutDescription = { ...mockTask, description: "" };
            render(
                <TaskItem
                    task={taskWithoutDescription}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(
                screen.queryByTestId("task-description")
            ).not.toBeInTheDocument();
        });

        it("renders edit and delete buttons", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("edit-button")).toBeInTheDocument();
            expect(screen.getByTestId("delete-button")).toBeInTheDocument();
        });

        it("has correct test id", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
        });
    });

    describe("Status Badge", () => {
        it("renders correct status text for TO_DO", () => {
            const task = { ...mockTask, status: "TO_DO" as const };
            render(
                <TaskItem
                    task={task}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("status-badge")).toHaveTextContent(
                "To Do"
            );
        });

        it("renders correct status text for IN_PROGRESS", () => {
            const task = { ...mockTask, status: "IN_PROGRESS" as const };
            render(
                <TaskItem
                    task={task}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("status-badge")).toHaveTextContent(
                "In Progress"
            );
        });

        it("renders correct status text for DONE", () => {
            const task = { ...mockTask, status: "DONE" as const };
            render(
                <TaskItem
                    task={task}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("status-badge")).toHaveTextContent(
                "Done"
            );
        });

        it("applies correct CSS classes for TO_DO status", () => {
            const task = { ...mockTask, status: "TO_DO" as const };
            render(
                <TaskItem
                    task={task}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const badge = screen.getByTestId("status-badge");
            expect(badge).toHaveClass(
                "bg-gray-100",
                "text-gray-800",
                "border-gray-300"
            );
        });

        it("applies correct CSS classes for IN_PROGRESS status", () => {
            const task = { ...mockTask, status: "IN_PROGRESS" as const };
            render(
                <TaskItem
                    task={task}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const badge = screen.getByTestId("status-badge");
            expect(badge).toHaveClass(
                "bg-blue-100",
                "text-blue-800",
                "border-blue-300"
            );
        });

        it("applies correct CSS classes for DONE status", () => {
            const task = { ...mockTask, status: "DONE" as const };
            render(
                <TaskItem
                    task={task}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const badge = screen.getByTestId("status-badge");
            expect(badge).toHaveClass(
                "bg-green-100",
                "text-green-800",
                "border-green-300"
            );
        });

        it("applies default CSS classes for unknown status", () => {
            const task = { ...mockTask, status: "UNKNOWN" as Task["status"] };
            render(
                <TaskItem
                    task={task}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const badge = screen.getByTestId("status-badge");
            expect(badge).toHaveClass(
                "bg-gray-100",
                "text-gray-800",
                "border-gray-300"
            );
        });
    });

    describe("Interactions", () => {
        it("calls onEdit with correct task id when edit button is clicked", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const editButton = screen.getByTestId("edit-button");
            fireEvent.click(editButton);

            expect(mockOnEdit).toHaveBeenCalledWith("1");
            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });

        it("calls onDelete with correct task id and title when delete button is clicked", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const deleteButton = screen.getByTestId("delete-button");
            fireEvent.click(deleteButton);

            expect(mockOnDelete).toHaveBeenCalledWith("1", "Test Task");
            expect(mockOnDelete).toHaveBeenCalledTimes(1);
        });

        it("has correct accessibility attributes", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("edit-button")).toHaveAttribute(
                "title",
                "Edit task"
            );
            expect(screen.getByTestId("delete-button")).toHaveAttribute(
                "title",
                "Delete task"
            );
        });
    });

    describe("Visual States", () => {
        it("has hover classes applied", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const taskItem = screen.getByTestId("task-item-1");
            expect(taskItem).toHaveClass(
                "hover:shadow-md",
                "transition-shadow"
            );
        });

        it("edit button has correct hover classes", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const editButton = screen.getByTestId("edit-button");
            expect(editButton).toHaveClass(
                "hover:text-blue-600",
                "hover:bg-blue-50",
                "transition-colors"
            );
        });

        it("delete button has correct hover classes", () => {
            render(
                <TaskItem
                    task={mockTask}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            const deleteButton = screen.getByTestId("delete-button");
            expect(deleteButton).toHaveClass(
                "hover:text-red-600",
                "hover:bg-red-50",
                "transition-colors"
            );
        });
    });

    describe("Edge Cases", () => {
        it("handles task with null description", () => {
            const taskWithNullDescription = {
                ...mockTask,
                description: "",
            };
            render(
                <TaskItem
                    task={taskWithNullDescription}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(
                screen.queryByTestId("task-description")
            ).not.toBeInTheDocument();
        });

        it("handles task with undefined description", () => {
            const taskWithUndefinedDescription = {
                ...mockTask,
                description: "",
            };
            render(
                <TaskItem
                    task={taskWithUndefinedDescription}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(
                screen.queryByTestId("task-description")
            ).not.toBeInTheDocument();
        });

        it("handles very long task title", () => {
            const longTitle =
                "This is a very long task title that should wrap properly and not break the layout when displayed in the UI";
            const taskWithLongTitle = { ...mockTask, title: longTitle };
            render(
                <TaskItem
                    task={taskWithLongTitle}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByText(longTitle)).toBeInTheDocument();
        });

        it("handles very long description", () => {
            const longDescription =
                "This is a very long description that contains multiple sentences and should be displayed properly without breaking the component layout. It might wrap to multiple lines but should still be readable and accessible.";
            const taskWithLongDescription = {
                ...mockTask,
                description: longDescription,
            };
            render(
                <TaskItem
                    task={taskWithLongDescription}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(screen.getByTestId("task-description")).toHaveTextContent(
                longDescription
            );
        });

        it("handles empty string title", () => {
            const taskWithEmptyTitle = { ...mockTask, title: "" };
            render(
                <TaskItem
                    task={taskWithEmptyTitle}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );

            expect(
                screen.getByRole("heading", { level: 3 })
            ).toBeInTheDocument();
        });
    });
});

export default TaskItem;
