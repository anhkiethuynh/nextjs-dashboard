"use server";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  date: z.string(),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than 0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  message?: null | string;
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  console.log("🚀 ~ createInvoice ~ validatedFields:", validatedFields);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoices.",
    };
  }
  const { customerId, amount, status } = validatedFields?.data;

  const amountIncents = amount * 100;
  const date = new Date().toISOString().split("T")[0];
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountIncents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: "Database Error: Failed To Create Invoice",
    };
  }
  //   const testRawdata = Object.fromEntries(formData.entries());
  //   const formSchema
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export const updateInvoice = async (
  id: string,
  prevState: State,
  formData: FormData
) => {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      message: "Missing Fields. Failed to Update Invoices",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountIncents = amount * 100;
  try {
    await sql`
    UPDATE invoices 
    SET customer_id = ${customerId}, amount = ${amountIncents}, status=${status}
    WHERE id=${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
};

export const deleteInvocie = async (id: string) => {
  try {
    sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted Invoice." };
  } catch (error) {
    return {
      message: "Db Error: Failed to delete Invoice.",
    };
  }
};
