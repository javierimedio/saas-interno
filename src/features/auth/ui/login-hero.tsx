import Image from 'next/image'

import { BRAND } from '@/lib/brand'

/**
 * Lado de marca del login (docs de producto: misma filosofía que
 * portadaspersonalizadas.vercel.app — pantalla limpia, gran imagen corporativa, branding
 * fuerte). `BRAND.loginBackgroundUrl` está preparado para una fotografía corporativa real;
 * mientras no exista, se usa un fondo de marca (gradiente) para no dejar el hueco vacío.
 */
export function LoginHero() {
  return (
    <div
      className="relative hidden overflow-hidden bg-[#0b1f1f] lg:flex lg:w-[58%] lg:flex-col lg:justify-between"
      style={
        BRAND.loginBackgroundUrl
          ? { backgroundImage: `url(${BRAND.loginBackgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      }
    >
      {!BRAND.loginBackgroundUrl ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 15% 10%, rgba(31,111,120,0.55) 0%, rgba(11,31,31,0.95) 55%, #0a1717 100%)',
          }}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-black/45" aria-hidden />
      )}

      <div className="relative flex flex-1 flex-col justify-between p-12">
        <Image src={BRAND.logoWhiteUrl} alt={BRAND.name} width={180} height={48} className="h-10 w-auto" priority />

        <div className="max-w-md">
          <p className="text-nexo-subtitle text-white/70">Ecosistema {BRAND.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Nexo</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            La herramienta interna para gestionar personas, 1:1, desarrollo y objetivos del equipo.
          </p>
        </div>

        <div className="flex items-center gap-6 opacity-70 grayscale">
          {BRAND.partnerBrands.map((brand) => (
            <Image
              key={brand.name}
              src={brand.logoUrl}
              alt={brand.name}
              width={90}
              height={28}
              className="h-5 w-auto brightness-0 invert"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
