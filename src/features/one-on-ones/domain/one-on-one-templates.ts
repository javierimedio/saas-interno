/**
 * Catálogo de plantillas y bloques del One2One (docs/product-design/02-user-experience.md §2.4).
 * Vive en código, no en base de datos: añadir o ajustar una plantilla es un cambio de código, sin
 * migraciones. Cada reunión guarda su propia lista de bloques resuelta en el momento de crearse
 * (ver `resolveTemplateBlocks`), así que cambiar aquí el contenido de una plantilla nunca reescribe
 * reuniones ya creadas.
 */

export const NARRATIVE_BLOCKS = {
  how_are_you: {
    title: 'Cómo estás',
    description: 'Antes de hablar de proyectos y objetivos, dediquemos unos minutos a entender cómo estás viviendo este momento.',
    fields: [
      { key: 'general_feeling', label: '¿Cómo te encuentras en general, más allá del trabajo?' },
      { key: 'workload', label: '¿Cómo sientes la carga de trabajo estas semanas?' },
      { key: 'concerns', label: '¿Hay algo que te esté preocupando o quitando energía?' },
    ],
  },
  balance: {
    title: 'Balance desde el último One2One',
    description: 'Reflexionemos sobre lo ocurrido desde la última vez que hablamos: qué merece la pena repetir, mejorar o aprender.',
    fields: [
      { key: 'went_well', label: 'Lo que ha funcionado bien' },
      { key: 'difficulties', label: 'Dificultades' },
      { key: 'learnings', label: 'Aprendizajes' },
      { key: 'proudest', label: '¿De qué te sientes más orgulloso/a desde el último One2One?' },
    ],
  },
  work_organization: {
    title: 'Trabajo y organización',
    description: 'Busquemos oportunidades para mejorar procesos, eliminar bloqueos y trabajar de forma más eficiente.',
    fields: [
      { key: 'tools_processes', label: '¿Los procesos y herramientas actuales te ayudan o te frenan?' },
      { key: 'organization', label: '¿Hay algo en cómo organizas tu trabajo que te gustaría cambiar?' },
      { key: 'blockers', label: '¿Hay algún bloqueo que dependa de otras personas o equipos?' },
      { key: 'collaboration', label: '¿Cómo está funcionando la colaboración con el resto del equipo?' },
    ],
  },
  professional_development: {
    title: 'Desarrollo profesional',
    description: 'Identifiquemos fortalezas y acordemos los próximos pasos para impulsar tu desarrollo.',
    fields: [
      { key: 'strengths', label: 'Fortalezas observadas' },
      { key: 'next_challenge', label: 'Próximo reto profesional' },
      { key: 'competencies_to_develop', label: 'Competencias a desarrollar' },
      { key: 'training_needed', label: 'Formación o recursos necesarios' },
    ],
  },
  onboarding_adaptation: {
    title: 'Adaptación',
    description: 'Cómo está siendo la incorporación al equipo y a la empresa.',
    fields: [{ key: 'adaptation', label: '¿Cómo te estás adaptando?' }],
  },
  onboarding_training: {
    title: 'Formación',
    description: 'Formación recibida hasta ahora y necesidades detectadas.',
    fields: [{ key: 'training', label: '¿Qué formación has recibido y qué crees que te falta?' }],
  },
  onboarding_difficulties: {
    title: 'Dificultades',
    description: 'Obstáculos encontrados durante estas primeras semanas.',
    fields: [{ key: 'difficulties', label: '¿Con qué dificultades te has encontrado?' }],
  },
  onboarding_initial_goals: {
    title: 'Objetivos iniciales',
    description: 'Primeros objetivos para este periodo de incorporación.',
    fields: [{ key: 'initial_goals', label: '¿Cuáles son tus primeros objetivos?' }],
  },
} as const

export type NarrativeBlockKey = keyof typeof NARRATIVE_BLOCKS

/** Bloques especiales: no guardan su contenido en meeting_data (o no son texto libre). */
export const SPECIAL_BLOCKS = {
  preparation: { title: 'Preparación', description: 'Contexto de la persona desde el último One2One.' },
  feedback: { title: 'Feedback bidireccional', description: 'El feedback solo genera valor cuando fluye en ambos sentidos.' },
  action_plan: { title: 'Plan de acción', description: 'Acciones realmente prioritarias hasta la próxima reunión.' },
  next_meeting: { title: 'Próximo One2One', description: 'Fecha aproximada y objetivo principal de la próxima conversación.' },
} as const

export type SpecialBlockKey = keyof typeof SPECIAL_BLOCKS
export type BlockKey = NarrativeBlockKey | SpecialBlockKey

export const ONE_ON_ONE_TEMPLATE = ['onboarding', 'periodic_follow_up', 'professional_development', 'annual_evaluation', 'custom'] as const
export type OneOnOneTemplateKey = (typeof ONE_ON_ONE_TEMPLATE)[number]

export const ONE_ON_ONE_TEMPLATE_LABELS: Record<OneOnOneTemplateKey, string> = {
  onboarding: 'Incorporación',
  periodic_follow_up: 'Seguimiento periódico',
  professional_development: 'Desarrollo profesional',
  annual_evaluation: 'Evaluación anual',
  custom: 'Personalizado',
}

/** Bloques narrativos de cada plantilla, en orden. preparation/action_plan/next_meeting se añaden siempre. */
const TEMPLATE_NARRATIVE_BLOCKS: Record<Exclude<OneOnOneTemplateKey, 'custom'>, NarrativeBlockKey[]> = {
  onboarding: ['onboarding_adaptation', 'onboarding_training', 'onboarding_difficulties', 'onboarding_initial_goals'],
  periodic_follow_up: ['how_are_you', 'balance', 'work_organization'],
  professional_development: ['professional_development'],
  annual_evaluation: ['how_are_you', 'balance', 'work_organization', 'professional_development'],
}

/** Plantillas que incluyen el bloque de feedback bidireccional además de sus bloques narrativos. */
const TEMPLATES_WITH_FEEDBACK: Exclude<OneOnOneTemplateKey, 'custom'>[] = ['professional_development', 'annual_evaluation']

export const CUSTOMIZABLE_BLOCK_KEYS: NarrativeBlockKey[] = Object.keys(NARRATIVE_BLOCKS) as NarrativeBlockKey[]

/**
 * Resuelve la lista ordenada y definitiva de bloques de una reunión concreta. Se llama una única
 * vez, al crear la reunión, y el resultado se guarda — cambios futuros en las plantillas no afectan
 * a reuniones ya creadas.
 */
export function resolveTemplateBlocks(templateKey: OneOnOneTemplateKey, customBlockKeys?: NarrativeBlockKey[]): BlockKey[] {
  if (templateKey === 'custom') {
    return ['preparation', ...(customBlockKeys ?? []), 'action_plan', 'next_meeting']
  }

  const blocks: BlockKey[] = ['preparation', ...TEMPLATE_NARRATIVE_BLOCKS[templateKey]]
  if (TEMPLATES_WITH_FEEDBACK.includes(templateKey)) blocks.push('feedback')
  blocks.push('action_plan', 'next_meeting')
  return blocks
}
