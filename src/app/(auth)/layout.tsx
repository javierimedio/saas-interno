import Image from 'next/image'

import { BRAND } from '@/lib/brand'

/**
 * Portada corporativa (misma filosofía que las demás herramientas internas del grupo:
 * pantalla completa, overlay oscuro, login centrado, branding fuerte — nunca dos columnas).
 * `BRAND.loginBackgroundUrl` queda preparado para sustituir el degradado por una fotografía
 * corporativa real: el degradado se pinta siempre debajo, así que si la imagen no existe o
 * no carga, la pantalla sigue viéndose intencional en vez de rota.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-brand-chrome px-4 py-12"
      style={
        BRAND.loginBackgroundUrl
          ? { backgroundImage: `url(${BRAND.loginBackgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      }
    >
      <div
        className="absolute inset-0"
        style={{
          background: BRAND.loginBackgroundUrl
            ? 'linear-gradient(rgba(0,0,0,.68), rgba(0,0,0,.8))'
            : 'radial-gradient(130% 110% at 20% 0%, rgba(186,117,23,0.16) 0%, rgba(44,44,42,0.98) 55%, #201f1d 100%)',
        }}
        aria-hidden
      />

      <Image
        src={BRAND.logoWhiteUrl}
        alt={BRAND.name}
        width={220}
        height={56}
        className="relative h-12 w-auto object-contain animate-in fade-in slide-in-from-top-2 duration-500"
        priority
      />

      <div className="relative w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">{children}</div>

      <div className="relative flex items-center gap-8">
        {BRAND.partnerBrands.map((brand) => (
          <Image
            key={brand.name}
            src={brand.logoUrl}
            alt={brand.name}
            width={90}
            height={20}
            className="h-4 w-auto object-contain opacity-55 brightness-0 invert transition-opacity hover:opacity-90"
          />
        ))}
      </div>
    </div>
  )
}
