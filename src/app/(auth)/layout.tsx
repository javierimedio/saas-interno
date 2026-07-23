import Image from 'next/image'

import { BRAND } from '@/lib/brand'
import { LoginHero } from '@/features/auth/ui/login-hero'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <LoginHero />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <Image
          src={BRAND.logoWhiteUrl}
          alt={BRAND.name}
          width={140}
          height={36}
          className="h-8 w-auto brightness-0 lg:hidden dark:invert"
        />
        {children}
      </div>
    </div>
  )
}
