import { describe, expect, it } from 'vitest'

import { resolveTemplateBlocks } from '@/features/one-on-ones/domain/one-on-one-templates'

describe('resolveTemplateBlocks', () => {
  it('siempre añade preparación primero y plan de acción + próximo one2one al final', () => {
    const blocks = resolveTemplateBlocks('periodic_follow_up')
    expect(blocks[0]).toBe('preparation')
    expect(blocks.slice(-2)).toEqual(['action_plan', 'next_meeting'])
  })

  it('seguimiento periódico empieza por la persona (cómo estás, organización) antes del balance, sin feedback', () => {
    const blocks = resolveTemplateBlocks('periodic_follow_up')
    expect(blocks).toEqual(['preparation', 'how_are_you', 'work_organization', 'balance', 'action_plan', 'next_meeting'])
  })

  it('evaluación anual incluye todos los bloques narrativos y feedback, empezando por la persona', () => {
    const blocks = resolveTemplateBlocks('annual_evaluation')
    expect(blocks).toEqual([
      'preparation',
      'how_are_you',
      'work_organization',
      'balance',
      'professional_development',
      'feedback',
      'action_plan',
      'next_meeting',
    ])
  })

  it('incorporación usa los bloques específicos de onboarding', () => {
    const blocks = resolveTemplateBlocks('onboarding')
    expect(blocks).toEqual([
      'preparation',
      'onboarding_adaptation',
      'onboarding_training',
      'onboarding_difficulties',
      'onboarding_initial_goals',
      'action_plan',
      'next_meeting',
    ])
  })

  it('personalizado respeta los bloques elegidos por el usuario', () => {
    const blocks = resolveTemplateBlocks('custom', ['balance', 'professional_development'])
    expect(blocks).toEqual(['preparation', 'balance', 'professional_development', 'action_plan', 'next_meeting'])
  })

  it('personalizado sin bloques elegidos solo tiene preparación, plan y próximo one2one', () => {
    expect(resolveTemplateBlocks('custom')).toEqual(['preparation', 'action_plan', 'next_meeting'])
  })
})
