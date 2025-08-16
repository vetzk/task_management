import * as z from "zod";
export const CreateFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title cannot be empty",
    }),
    description: z.string().optional(),
    // status: z.enum(["DONE", "IN_PROGRESS", "TO_DO"]),
});
