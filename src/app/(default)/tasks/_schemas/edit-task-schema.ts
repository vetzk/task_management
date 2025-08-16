import * as z from "zod";
export const EditFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title cannot be empty",
    }),
    description: z.string().optional(),
    status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]),
});
