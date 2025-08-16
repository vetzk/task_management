"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Container from "@/components/container";
import FormEditTask from "./_components/form-edit-task";
import { getTaskDetails } from "@/app/(default)/(home)/actions";

export default function EditTaskPage() {
    const params = useParams();
    const router = useRouter();

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const taskId = params.id ? (params.id as string) : null;

    useEffect(() => {
        const fetchTask = async () => {
            if (!taskId) {
                setError("Invalid task ID");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await getTaskDetails(taskId);

                if (response.success) {
                    setTask(response.data);
                    setError(null);
                    return;
                } else {
                    throw new Error("Server fetch failed");
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setError("Failed to fetch task");
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [taskId]);

    if (loading) {
        return (
            <Container>
                <div className="w-full flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Loading task...</p>
                    </div>
                </div>
            </Container>
        );
    }

    if (error || !task) {
        return (
            <Container>
                <div className="max-w-2xl mx-auto p-6">
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/")}
                            className="p-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Task Not Found
                            </h1>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 text-xl">⚠️</span>
                        </div>
                        <h2 className="text-lg font-semibold text-red-800 mb-2">
                            {error || "Task not found"}
                        </h2>
                        <p className="text-red-600 mb-4">
                            The task you&apos;re looking for doesn&apos;t exist
                            or couldn&apos;t be loaded.
                        </p>
                        <Button
                            onClick={() => router.push("/")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Back to Tasks
                        </Button>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <FormEditTask task={task} />
        </Container>
    );
}
