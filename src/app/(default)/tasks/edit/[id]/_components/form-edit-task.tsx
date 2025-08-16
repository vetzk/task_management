"use client";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { EditFormSchema } from "../../../_schemas/edit-task-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/task";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/app/(default)/(home)/actions";

interface FormEditTaskProps {
    task: Task;
}

const statusOptions = [
    { value: "TO_DO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
];

export default function FormEditTask({ task }: FormEditTaskProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const defaultValues = useMemo(
        () => ({
            title: task.title,
            status: task.status,
            description: task.description || "",
        }),
        [task]
    );

    const form = useForm<z.infer<typeof EditFormSchema>>({
        resolver: zodResolver(EditFormSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [form, defaultValues]);

    const updateTaskMutation = useMutation({
        mutationFn: (data: z.infer<typeof EditFormSchema>) =>
            updateTask(task.id, data),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message);

                queryClient.invalidateQueries({ queryKey: ["tasks"] });

                queryClient.setQueriesData(
                    { queryKey: ["tasks"] },
                    (oldData: { data: Task[] }) => {
                        if (!oldData?.data) return oldData;
                        return {
                            ...oldData,
                            data: oldData.data.map((t: Task) =>
                                t.id === task.id
                                    ? {
                                          ...t,
                                          ...form.getValues(),
                                          updatedAt: new Date().toISOString(),
                                      }
                                    : t
                            ),
                        };
                    }
                );

                queryClient.setQueryData(
                    ["task", task.id],
                    (oldTask: Task | undefined) => {
                        if (!oldTask) return oldTask;
                        return {
                            ...oldTask,
                            ...form.getValues(),
                            updatedAt: new Date().toISOString(),
                        };
                    }
                );

                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                throw new Error(result.message || "Failed to update task");
            }
        },
        onError: (error) => {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to update task";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: z.infer<typeof EditFormSchema>) => {
        updateTaskMutation.mutate(data);
    };

    const handleCancel = () => {
        if (updateTaskMutation.isPending) {
            toast.warning("Please wait for the update to complete");
            return;
        }
        router.push("/");
    };

    const isLoading = updateTaskMutation.isPending;
    const hasChanges = form.formState.isDirty;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white">
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="p-2"
                    disabled={isLoading}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Task
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Update your existing task
                    </p>
                </div>
            </div>

            {hasChanges && !isLoading && !updateTaskMutation.isSuccess && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        You have unsaved changes
                    </p>
                </div>
            )}

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Title<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter task title..."
                                        {...field}
                                        className="w-full"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Status
                                    <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select task status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter task description (optional)..."
                                        {...field}
                                        className="w-full min-h-[100px]"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isLoading ||
                                !form.formState.isValid ||
                                !hasChanges
                            }
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Task...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Task
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {Object.keys(form.formState.errors).length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                        Please fix the following errors:
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                        {Object.entries(form.formState.errors).map(
                            ([field, error]) => (
                                <li
                                    key={field}
                                    className="flex items-center gap-2"
                                >
                                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                    {error?.message}
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}

            {updateTaskMutation.isSuccess && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                            <h3 className="text-sm font-medium text-green-900">
                                Task Updated Successfully!
                            </h3>
                            <p className="text-sm text-green-800 mt-1">
                                Your changes have been saved. Redirecting to
                                tasks page...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {updateTaskMutation.isError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-red-900">
                                Update Failed
                            </h3>
                            <p className="text-sm text-red-800 mt-1">
                                {updateTaskMutation.error instanceof Error
                                    ? updateTaskMutation.error.message
                                    : "An unexpected error occurred. Please try again."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!updateTaskMutation.isSuccess && !updateTaskMutation.isError && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-900 mb-1">
                                What happens next?
                            </h3>
                            <p className="text-sm text-blue-800">
                                Once you update the task, you&apos;ll be
                                redirected to the main tasks page where you can
                                view all your updated tasks.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Current Task Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>
                        <span className="font-medium">Original Title:</span>{" "}
                        {task.title}
                    </p>
                    <p>
                        <span className="font-medium">Original Status:</span>{" "}
                        {task.status.replace("_", " ")}
                    </p>
                    {task.description && (
                        <p>
                            <span className="font-medium">
                                Original Description:
                            </span>{" "}
                            {task.description}
                        </p>
                    )}
                    {task.createdAt && (
                        <p>
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <p className="text-gray-700">
                                Updating your task...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
