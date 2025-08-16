"use client";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CreateFormSchema } from "../_schemas/create-task-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "../../(home)/actions";
import { Task } from "@/types/task";

export default function FormCreateNewTask() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: zodResolver(CreateFormSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: (data: z.infer<typeof CreateFormSchema>) =>
            createTask(data),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message);

                queryClient.invalidateQueries({ queryKey: ["tasks"] });

                if (result.data) {
                    queryClient.setQueryData(
                        ["tasks", 1, "", 10],
                        (oldData: { data: Task[] }) => {
                            if (!oldData?.data) return oldData;
                            return {
                                ...oldData,
                                data: [result.data, ...oldData.data],
                            };
                        }
                    );
                }

                form.reset();

                router.push("/");
            } else {
                throw new Error(result.message || "Failed to create task");
            }
        },
        onError: (error) => {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create task";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: z.infer<typeof CreateFormSchema>) => {
        createTaskMutation.mutate(data);
    };

    const handleCancel = () => {
        if (createTaskMutation.isPending) {
            toast.warning("Please wait for the task creation to complete");
            return;
        }
        router.push("/");
    };

    const isLoading = createTaskMutation.isPending;

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
                        Create New Task
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Add a new task to your list
                    </p>
                </div>
            </div>

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
                                <FormMessage>
                                    {form.formState.errors.title?.message}
                                </FormMessage>
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
                                <FormMessage>
                                    {form.formState.errors.description?.message}
                                </FormMessage>
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
                            disabled={isLoading || !form.formState.isValid}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Task...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Task
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

            {createTaskMutation.isSuccess && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                            <h3 className="text-sm font-medium text-green-900">
                                Task Created Successfully!
                            </h3>
                            <p className="text-sm text-green-800 mt-1">
                                Your task has been added to your task list.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {createTaskMutation.isError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-red-900">
                                Creation Failed
                            </h3>
                            <p className="text-sm text-red-800 mt-1">
                                {createTaskMutation.error instanceof Error
                                    ? createTaskMutation.error.message
                                    : "An unexpected error occurred. Please try again."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!createTaskMutation.isSuccess && !createTaskMutation.isError && (
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
                                Once you create the task, you&apos;ll be
                                redirected to the main tasks page where you can
                                view, edit, or manage all your tasks.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <p className="text-gray-700">
                                Creating your task...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
