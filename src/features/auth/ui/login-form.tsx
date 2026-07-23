'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-7">
        <h1 className="text-nexo-title text-2xl">{mode === 'sign-in' ? 'Inicia sesión' : 'Crea tu acceso'}</h1>
        <p className="text-nexo-subtitle mt-1.5 text-[13px]">
          {mode === 'sign-in'
            ? 'Accede a Nexo con tu cuenta de GOR FACTORY.'
            : 'Regístrate con el email que te ha dado tu administrador.'}
        </p>
      </div>

      {mode === 'sign-in' ? <SignInForm /> : <SignUpForm />}

      <button
        type="button"
        onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
        className="mt-6 text-[13px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {mode === 'sign-in' ? '¿Primer acceso? Crea tu cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
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
                <Input type="email" autoComplete="email" autoFocus {...field} />
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
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" autoFocus {...field} />
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
        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organización (solo si eres el primer acceso)</FormLabel>
              <FormControl>
                <Input placeholder="Marketing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {isSubmitting ? 'Creando…' : 'Crear cuenta'}
        </Button>
      </form>
    </Form>
  )
}
