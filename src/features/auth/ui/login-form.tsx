'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '../domain/auth.schema'
import { signInAction } from '../application/sign-in.action'
import { signUpAction } from '../application/sign-up.action'

export function LoginForm() {
  const [mode, setMode] = React.useState<'sign-in' | 'sign-up'>('sign-in')

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <div className="text-lg font-semibold">{mode === 'sign-in' ? 'Inicia sesión' : 'Crea tu organización'}</div>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'sign-in'
            ? 'Accede a Nexo para gestionar a tu equipo.'
            : 'El primer registro crea tu organización y tu acceso de administrador.'}
        </p>
      </div>

      {mode === 'sign-in' ? <SignInForm /> : <SignUpForm />}

      <button
        type="button"
        onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {mode === 'sign-in' ? '¿Primera vez? Crea tu organización' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  )
}

function SignInForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: SignInInput) {
    setIsSubmitting(true)
    const result = await signInAction(values)
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}

function SignUpForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { organizationName: '', email: '', password: '' },
  })

  async function onSubmit(values: SignUpInput) {
    setIsSubmitting(true)
    const result = await signUpAction(values)
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de tu organización</FormLabel>
              <FormControl>
                <Input placeholder="Marketing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando…' : 'Crear organización'}
        </Button>
      </form>
    </Form>
  )
}
