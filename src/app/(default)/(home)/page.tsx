import React from "react";
import TaskListContent from "./_components/task-list-content";
import Container from "@/components/container";

export default function HomePage() {
    return (
        <Container>
            <div className="w-full">
                <TaskListContent />
            </div>
        </Container>
    );
}
