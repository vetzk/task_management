import React from "react";

export default function Container({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="max-w-screen mx-auto h-screen bg-white overflow-x-hidden">
            <main className="max-w-[1440px] flex mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
