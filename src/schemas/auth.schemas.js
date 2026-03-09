import { z } from "zod"

export const registerSchema = z.object({
    name: z.string({
        required_error: "Nombre es requerido"
    }).min(2, {
        message: { name_min: "Nombre debe contener mínimo 2 caracteres" }
    }).max(50, {
        message: { name_max: "Nombre debe contener máximo 50 caracteres" }
    }),
    username: z.string({
        required_error: "Nombre de usuario es requerido"
    }).min(5, {
        message: { username_min: "Nombre de usuario debe contener mínimo 5 caracteres" }
    }).max(40, {
        message: { username_max:"Nombre de usuario debe contener máximo 40 caracteres" }
    }),
    email: z.string({
        required_error: "Correo electrónico es requerido"
    }).email({
        message: { email_inv: "Correo electrónico inválido" }
    }),
    password: z.string({
        required_error: "Contraseña es requerida"
    }).min(6, {
        message: { password_min: "Contraseña debe tener como mínimo 6 caracteres" }
    }),
    birthDate: z.string({
        required_error: "Fecha de nacimiento es requerida"
    })
        .refine((date) => new Date(date).toDateString() !== 'Fecha invalida')
        .transform((date) => new Date(date)),
})

export const loginSchema = z.object({
    email: z.string({
        required_error: "Correo electrónico es requerido"
    }).email({
        invalid_email: "Correo electrónico inválido"
    }),
    password: z.string({
        required_error: "Contraseña es requerida"
    })
})