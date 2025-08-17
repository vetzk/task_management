import "@testing-library/jest-dom";
import React from "react";
import "whatwg-fetch";
import { Task } from "./types/task";

declare global {
    var testUtils: {
        createMockTask: (overrides?: Partial<Task>) => Task;
        createMockTasks: (count?: number) => Task[];
        waitFor: (ms?: number) => Promise<void>;
    };
}

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next/image", () => ({
    __esModule: true,

    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
        return React.createElement("img", props);
    },
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        loading: jest.fn(),
        dismiss: jest.fn(),
    },
    Toaster: () => null,
}));

const originalError = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === "string" &&
        args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
        return;
    }
    originalError.call(console, ...args);
};

global.testUtils = {
    createMockTask: (overrides = {}) => ({
        id: "1",
        title: "Test Task",
        description: "Test Description",
        status: "TO_DO",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    }),

    createMockTasks: (count = 3) =>
        Array.from({ length: count }, (_, index) => ({
            id: `${index + 1}`,
            title: `Test Task ${index + 1}`,
            description: `Description for task ${index + 1}`,
            status: ["TO_DO", "IN_PROGRESS", "DONE"][
                index % 3
            ] as Task["status"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })),

    waitFor: (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms)),
};
