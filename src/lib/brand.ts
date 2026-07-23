/**
 * Identidad GOR FACTORY — activos centralizados aquí para poder sustituirlos sin tocar
 * componentes. `loginBackgroundUrl` queda a null hasta que exista una fotografía
 * corporativa real; mientras tanto el login usa un fondo de marca (gradiente + wordmark).
 */
export const BRAND = {
  name: 'GOR FACTORY',
  logoWhiteUrl: 'https://paqtohmxagfebeyyurlq.supabase.co/storage/v1/object/public/assets/GORFACTORY_LOGO_BLANCO.png',
  loginBackgroundUrl: null as string | null,
  partnerBrands: [
    { name: 'Roly', logoUrl: 'https://static.gorfactory.es/images/header/logo_Roly_2025.svg' },
    { name: 'WRK', logoUrl: 'https://static.gorfactory.es/images/home/Logo_WRK_color.svg' },
    { name: 'STM', logoUrl: 'https://static.gorfactory.es/images/header/logo-stm-small.svg' },
  ],
} as const
