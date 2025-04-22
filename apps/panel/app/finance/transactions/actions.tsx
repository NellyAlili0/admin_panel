"use server";

import { db } from "@repo/database";
import { Auth } from "@repo/handlers/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
    names: zfd.text(z.string()),
    email: zfd.text(z.string().email()),
    password: zfd.text(z.string()),
    role: zfd.text(z.enum(['Finance', 'Admin', 'Operations'])),
})

export async function addUser(prevState: any, formData: FormData) {
    try {
        const validatedFields = schema.safeParse(formData)
        if (!validatedFields.success) {
            return {
                errors: 'Invalid Data Submitted'
            }
        }
        const { names, email, password, role } = validatedFields.data
        let auth = new Auth();
        const hashedPassword = auth.hash({ password: password })
        const user = await db.insertInto('admin')
            .values({
                name: names,
                email,
                password: hashedPassword,
                role,
                status: 'Active'
            })
            .returning('id')
            .executeTakeFirst()
        if (!user) {
            return {
                errors: 'Failed to create user'
            }
        }
        revalidatePath('/admin/users')
        return {
            success: 'User created successfully'
        }
    } catch (error) {
        return {
            errors: 'Something went wrong'
        }
    }
}

const updateSchema = zfd.formData({
    id: zfd.text(z.string()),
    names: zfd.text(z.string()),
    email: zfd.text(z.string().email()),
    role: zfd.text(z.enum(['Finance', 'Admin', 'Operations'])),
    status: zfd.text(z.enum(['Active', 'Inactive'])),
})

export async function updateUser(prevState: any, formData: FormData) {
    try {
        const validatedFields = updateSchema.safeParse(formData)
        if (!validatedFields.success) {
            return {
                errors: 'Invalid Data Submitted'
            }
        }
        const { names, email, role, id, status } = validatedFields.data
        const user = await db.updateTable('admin')
            .set({
                name: names,
                email,
                role,
                status
            })
            .where('id', '=', Number(id))
            .returning('id')
            .executeTakeFirst()
        if (!user) {
            return {
                errors: 'Failed to update user'
            }
        }
        revalidatePath('/admin/users')
        return {
            success: 'User updated successfully'
        }
    } catch (error) {
        return {
            errors: 'Something went wrong'
        }
    }
}


const addDriverEarningSchema = zfd.formData({
    ride_id: zfd.text(z.string()),
    driver_id: zfd.text(z.string()),
    amount: zfd.text(z.string()),
    comments: zfd.text(z.string()),
    method: zfd.text(z.enum(['Cash', 'Card', 'Bank Transfer'])),
})

export async function addDriverEarning(prevState: any, formData: FormData) {
    try {
        const validatedFields = addDriverEarningSchema.safeParse(formData)
        if (!validatedFields.success) {
            return {
                errors: 'Invalid Data Submitted'
            }
        }
        const { ride_id, driver_id, amount, comments, method } = validatedFields.data
        const ride = await db.selectFrom('ride')
            .select(['id', 'driver_id'])
            .where('id', '=', Number(ride_id))
            .executeTakeFirst()
        if (!ride) {
            return {
                errors: 'Ride not found'
            }
        }
        if (ride.driver_id !== Number(driver_id)) {
            return {
                errors: 'Driver not found'
            }
        }
        const transaction = await db.insertInto('payment')
            .values({
                ride_id: Number(ride_id),
                driver_id: Number(driver_id),
                amount: Number(amount),
                comments,
                payment_method: method,
                payment_status: 'Paid'
            })
            .returning('id')
            .executeTakeFirst()
        if (!transaction) {
            return {
                errors: 'Failed to add transaction'
            }
        }
        // check driver id and send them an email and a push notification
        revalidatePath('/finance/transactions')

        return redirect('/finance')
    } catch (error) {
        return {
            errors: 'Something went wrong'
        }
    }
}

export async function searchDriver({ account }: { account: string }) {
    try {
        const driver = await db.selectFrom('user')
            .select(['id', 'first_name', 'last_name', 'phone_number', 'email', 'meta'])
            .where((eb) => eb.or([
                eb('email', '=', account),
                eb('phone_number', '=', account)
            ]))
            .executeTakeFirst()
        if (!driver) {
            return null
        }
        // check any active rides
        const activeRide = await db.selectFrom('ride')
            .select(['id', 'comments'])
            .where('driver_id', '=', driver.id)
            .where('status', '=', 'Active')
            .execute()
        return {
            driver,
            activeRide
        }
        // return {
        //     driver: {id: 1, first_name: 'John', last_name: 'Doe', phone_number: '1234567890', email: 'john.doe@example.com', meta: {
        //         payout: {
        //             bank: 'Bank of Africa',
        //             account_number: '1234567890',
        //             account_name: 'John Doe'
        //         }
        //     }},
        //     activeRide: [{id: 1, comments: 'Third term Daily rides'}]
        // }

    } catch (error) {
        return null
    }
}
