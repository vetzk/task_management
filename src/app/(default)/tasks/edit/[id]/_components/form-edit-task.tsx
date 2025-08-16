"use client";
import React, { useCallback, useState, useMemo } from "react";
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/task";
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
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

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

    const onSubmit = useCallback(
        async (data: z.infer<typeof EditFormSchema>) => {
            try {
                setLoading(true);

                const result = await updateTask(task.id, data);

                if (result.success) {
                    toast.success(result.message);
                    router.push("/");
                } else {
                    throw new Error("All update methods failed");
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update task"
                );
            } finally {
                setLoading(false);
            }
        },
        [router, task.id]
    );

    const handleCancel = () => {
        router.push("/");
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white">
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="p-2"
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
                                        disabled={loading}
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
                                        defaultValue={field.value}
                                        disabled={loading}
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
                                <FormMessage>
                                    {form.formState.errors.status?.message}
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
                                        disabled={loading}
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
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? (
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
                            Once you update the task, you&apos;ll be redirected
                            to the main tasks page where you can view all your
                            updated tasks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
