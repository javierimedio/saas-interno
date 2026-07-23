/**
 * Tipos generados a partir de supabase/migrations/*.sql, con la forma exacta que produce
 * `supabase gen types typescript`. Este entorno de desarrollo no tiene acceso a los registros
 * de contenedores que ese comando necesita (bloqueados por la política de red del sandbox),
 * así que este archivo se ha escrito a mano reflejando el esquema real ya aplicado y probado
 * en un Postgres nativo (ver docs/dev/01-personas.md). Regenerar con `npm run db:types` en
 * cuanto haya un proyecto Supabase (local con Docker o en la nube) accesible.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: Database['public']['Enums']['membership_role']
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: Database['public']['Enums']['membership_role']
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: Database['public']['Enums']['membership_role']
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'memberships_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          id: string
          organization_id: string
          name: string
          parent_department_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          parent_department_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          parent_department_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'departments_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'departments_parent_department_id_fkey'
            columns: ['parent_department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      people: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          position_title: string
          department_id: string | null
          manager_id: string | null
          hire_date: string
          termination_date: string | null
          employment_status: Database['public']['Enums']['employment_status']
          contract_type: Database['public']['Enums']['contract_type']
          birth_date: string | null
          employee_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          position_title: string
          department_id?: string | null
          manager_id?: string | null
          hire_date: string
          termination_date?: string | null
          employment_status?: Database['public']['Enums']['employment_status']
          contract_type: Database['public']['Enums']['contract_type']
          birth_date?: string | null
          employee_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          position_title?: string
          department_id?: string | null
          manager_id?: string | null
          hire_date?: string
          termination_date?: string | null
          employment_status?: Database['public']['Enums']['employment_status']
          contract_type?: Database['public']['Enums']['contract_type']
          birth_date?: string | null
          employee_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'people_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'people_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'people_manager_id_fkey'
            columns: ['manager_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      people_private_notes: {
        Row: {
          id: string
          organization_id: string
          person_id: string
          author_id: string
          note: string
          visibility: Database['public']['Enums']['note_visibility']
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          person_id: string
          author_id: string
          note: string
          visibility?: Database['public']['Enums']['note_visibility']
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          person_id?: string
          author_id?: string
          note?: string
          visibility?: Database['public']['Enums']['note_visibility']
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'people_private_notes_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      salary_records: {
        Row: {
          id: string
          organization_id: string
          person_id: string
          effective_date: string
          gross_annual_salary: number
          currency: string
          variable_comp: number | null
          reason: Database['public']['Enums']['salary_change_reason']
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          person_id: string
          effective_date: string
          gross_annual_salary: number
          currency?: string
          variable_comp?: number | null
          reason: Database['public']['Enums']['salary_change_reason']
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          person_id?: string
          effective_date?: string
          gross_annual_salary?: number
          currency?: string
          variable_comp?: number | null
          reason?: Database['public']['Enums']['salary_change_reason']
          notes?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'salary_records_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      working_hours_records: {
        Row: {
          id: string
          organization_id: string
          person_id: string
          effective_date: string
          weekly_hours: number
          working_percentage: number | null
          reason: string
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          person_id: string
          effective_date: string
          weekly_hours: number
          working_percentage?: number | null
          reason: string
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          person_id?: string
          effective_date?: string
          weekly_hours?: number
          working_percentage?: number | null
          reason?: string
          notes?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'working_hours_records_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          person_id: string
          uploaded_by: string
          storage_path: string
          file_name: string
          mime_type: string
          size_bytes: number
          category: Database['public']['Enums']['document_category']
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          person_id: string
          uploaded_by: string
          storage_path: string
          file_name: string
          mime_type: string
          size_bytes: number
          category?: Database['public']['Enums']['document_category']
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          person_id?: string
          uploaded_by?: string
          storage_path?: string
          file_name?: string
          mime_type?: string
          size_bytes?: number
          category?: Database['public']['Enums']['document_category']
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      audit_log: {
        Row: {
          id: string
          organization_id: string
          actor_id: string | null
          entity_type: string
          entity_id: string
          action: Database['public']['Enums']['audit_action']
          diff: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          actor_id?: string | null
          entity_type: string
          entity_id: string
          action: Database['public']['Enums']['audit_action']
          diff?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          actor_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: Database['public']['Enums']['audit_action']
          diff?: Json
          created_at?: string
        }
        Relationships: []
      }
      one_on_ones: {
        Row: {
          id: string
          organization_id: string
          person_id: string
          manager_id: string
          scheduled_at: string
          actual_started_at: string | null
          actual_ended_at: string | null
          status: Database['public']['Enums']['one_on_one_status']
          mode: Database['public']['Enums']['meeting_mode']
          manager_comments: string | null
          employee_comments: string | null
          overall_rating: number | null
          next_meeting_suggested_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          person_id: string
          manager_id: string
          scheduled_at: string
          actual_started_at?: string | null
          actual_ended_at?: string | null
          status?: Database['public']['Enums']['one_on_one_status']
          mode?: Database['public']['Enums']['meeting_mode']
          manager_comments?: string | null
          employee_comments?: string | null
          overall_rating?: number | null
          next_meeting_suggested_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          person_id?: string
          manager_id?: string
          scheduled_at?: string
          actual_started_at?: string | null
          actual_ended_at?: string | null
          status?: Database['public']['Enums']['one_on_one_status']
          mode?: Database['public']['Enums']['meeting_mode']
          manager_comments?: string | null
          employee_comments?: string | null
          overall_rating?: number | null
          next_meeting_suggested_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'one_on_ones_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'one_on_ones_manager_id_fkey'
            columns: ['manager_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      one_on_one_agenda_items: {
        Row: {
          id: string
          one_on_one_id: string
          topic: string
          source: string
          position: number
          discussed: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          one_on_one_id: string
          topic: string
          source?: string
          position?: number
          discussed?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          one_on_one_id?: string
          topic?: string
          source?: string
          position?: number
          discussed?: boolean
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'one_on_one_agenda_items_one_on_one_id_fkey'
            columns: ['one_on_one_id']
            isOneToOne: false
            referencedRelation: 'one_on_ones'
            referencedColumns: ['id']
          },
        ]
      }
      one_on_one_agreements: {
        Row: {
          id: string
          one_on_one_id: string
          description: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          one_on_one_id: string
          description: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          one_on_one_id?: string
          description?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'one_on_one_agreements_one_on_one_id_fkey'
            columns: ['one_on_one_id']
            isOneToOne: false
            referencedRelation: 'one_on_ones'
            referencedColumns: ['id']
          },
        ]
      }
      actions: {
        Row: {
          id: string
          organization_id: string
          person_id: string
          assignee_id: string
          one_on_one_id: string | null
          title: string
          description: string | null
          status: Database['public']['Enums']['action_status']
          priority: Database['public']['Enums']['action_priority']
          due_date: string | null
          blocked_reason: string | null
          completed_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          person_id: string
          assignee_id: string
          one_on_one_id?: string | null
          title: string
          description?: string | null
          status?: Database['public']['Enums']['action_status']
          priority?: Database['public']['Enums']['action_priority']
          due_date?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          person_id?: string
          assignee_id?: string
          one_on_one_id?: string | null
          title?: string
          description?: string | null
          status?: Database['public']['Enums']['action_status']
          priority?: Database['public']['Enums']['action_priority']
          due_date?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'actions_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'actions_assignee_id_fkey'
            columns: ['assignee_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'actions_one_on_one_id_fkey'
            columns: ['one_on_one_id']
            isOneToOne: false
            referencedRelation: 'one_on_ones'
            referencedColumns: ['id']
          },
        ]
      }
      action_comments: {
        Row: { id: string; action_id: string; author_id: string; comment: string; created_at: string }
        Insert: { id?: string; action_id: string; author_id: string; comment: string; created_at?: string }
        Update: { id?: string; action_id?: string; author_id?: string; comment?: string; created_at?: string }
        Relationships: [
          { foreignKeyName: 'action_comments_action_id_fkey'; columns: ['action_id']; isOneToOne: false; referencedRelation: 'actions'; referencedColumns: ['id'] },
        ]
      }
      goals: {
        Row: {
          id: string; organization_id: string; person_id: string; title: string; description: string | null
          category: string | null; year: number; start_date: string; end_date: string
          status: Database['public']['Enums']['goal_status']; weight: number | null
          created_by: string; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; organization_id: string; person_id: string; title: string; description?: string | null
          category?: string | null; year: number; start_date: string; end_date: string
          status?: Database['public']['Enums']['goal_status']; weight?: number | null
          created_by: string; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; organization_id?: string; person_id?: string; title?: string; description?: string | null
          category?: string | null; year?: number; start_date?: string; end_date?: string
          status?: Database['public']['Enums']['goal_status']; weight?: number | null
          created_by?: string; created_at?: string; updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'goals_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
        ]
      }
      goal_checkins: {
        Row: { id: string; goal_id: string; checkin_date: string; progress_percent: number; comment: string | null; created_by: string; created_at: string }
        Insert: { id?: string; goal_id: string; checkin_date?: string; progress_percent: number; comment?: string | null; created_by: string; created_at?: string }
        Update: { id?: string; goal_id?: string; checkin_date?: string; progress_percent?: number; comment?: string | null; created_by?: string; created_at?: string }
        Relationships: [
          { foreignKeyName: 'goal_checkins_goal_id_fkey'; columns: ['goal_id']; isOneToOne: false; referencedRelation: 'goals'; referencedColumns: ['id'] },
        ]
      }
      competencies: {
        Row: { id: string; organization_id: string; name: string; description: string | null; created_at: string }
        Insert: { id?: string; organization_id: string; name: string; description?: string | null; created_at?: string }
        Update: { id?: string; organization_id?: string; name?: string; description?: string | null; created_at?: string }
        Relationships: []
      }
      person_competencies: {
        Row: {
          id: string; organization_id: string; person_id: string; competency_id: string; level: number
          assessed_at: string; assessed_by: string; notes: string | null; created_at: string
        }
        Insert: {
          id?: string; organization_id: string; person_id: string; competency_id: string; level: number
          assessed_at?: string; assessed_by: string; notes?: string | null; created_at?: string
        }
        Update: {
          id?: string; organization_id?: string; person_id?: string; competency_id?: string; level?: number
          assessed_at?: string; assessed_by?: string; notes?: string | null; created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'person_competencies_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
          { foreignKeyName: 'person_competencies_competency_id_fkey'; columns: ['competency_id']; isOneToOne: false; referencedRelation: 'competencies'; referencedColumns: ['id'] },
        ]
      }
      trainings: {
        Row: {
          id: string; organization_id: string; person_id: string; title: string; provider: string | null
          status: Database['public']['Enums']['training_status']; start_date: string | null; end_date: string | null
          certificate_document_id: string | null; created_by: string; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; organization_id: string; person_id: string; title: string; provider?: string | null
          status?: Database['public']['Enums']['training_status']; start_date?: string | null; end_date?: string | null
          certificate_document_id?: string | null; created_by: string; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; organization_id?: string; person_id?: string; title?: string; provider?: string | null
          status?: Database['public']['Enums']['training_status']; start_date?: string | null; end_date?: string | null
          certificate_document_id?: string | null; created_by?: string; created_at?: string; updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'trainings_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
        ]
      }
      career_plans: {
        Row: { id: string; organization_id: string; person_id: string; target_position: string; notes: string | null; created_by: string; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; person_id: string; target_position: string; notes?: string | null; created_by: string; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; person_id?: string; target_position?: string; notes?: string | null; created_by?: string; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: 'career_plans_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
        ]
      }
      career_plan_milestones: {
        Row: { id: string; career_plan_id: string; title: string; target_date: string | null; completed_at: string | null; created_at: string }
        Insert: { id?: string; career_plan_id: string; title: string; target_date?: string | null; completed_at?: string | null; created_at?: string }
        Update: { id?: string; career_plan_id?: string; title?: string; target_date?: string | null; completed_at?: string | null; created_at?: string }
        Relationships: [
          { foreignKeyName: 'career_plan_milestones_career_plan_id_fkey'; columns: ['career_plan_id']; isOneToOne: false; referencedRelation: 'career_plans'; referencedColumns: ['id'] },
        ]
      }
      feedback_entries: {
        Row: { id: string; organization_id: string; person_id: string; author_id: string; text: string; visibility: Database['public']['Enums']['feedback_visibility']; created_at: string }
        Insert: { id?: string; organization_id: string; person_id: string; author_id: string; text: string; visibility?: Database['public']['Enums']['feedback_visibility']; created_at?: string }
        Update: { id?: string; organization_id?: string; person_id?: string; author_id?: string; text?: string; visibility?: Database['public']['Enums']['feedback_visibility']; created_at?: string }
        Relationships: [
          { foreignKeyName: 'feedback_entries_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
        ]
      }
      evaluations: {
        Row: { id: string; organization_id: string; person_id: string; period: string; result: string; evaluator_id: string; notes: string | null; created_at: string }
        Insert: { id?: string; organization_id: string; person_id: string; period: string; result: string; evaluator_id: string; notes?: string | null; created_at?: string }
        Update: { id?: string; organization_id?: string; person_id?: string; period?: string; result?: string; evaluator_id?: string; notes?: string | null; created_at?: string }
        Relationships: [
          { foreignKeyName: 'evaluations_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
        ]
      }
      time_off: {
        Row: { id: string; organization_id: string; person_id: string; start_date: string; end_date: string; type: Database['public']['Enums']['time_off_type']; notes: string | null; created_by: string; created_at: string }
        Insert: { id?: string; organization_id: string; person_id: string; start_date: string; end_date: string; type?: Database['public']['Enums']['time_off_type']; notes?: string | null; created_by: string; created_at?: string }
        Update: { id?: string; organization_id?: string; person_id?: string; start_date?: string; end_date?: string; type?: Database['public']['Enums']['time_off_type']; notes?: string | null; created_by?: string; created_at?: string }
        Relationships: [
          { foreignKeyName: 'time_off_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
        ]
      }
      holidays: {
        Row: { id: string; organization_id: string; date: string; name: string; created_at: string }
        Insert: { id?: string; organization_id: string; date: string; name: string; created_at?: string }
        Update: { id?: string; organization_id?: string; date?: string; name?: string; created_at?: string }
        Relationships: []
      }
      reports: {
        Row: {
          id: string; organization_id: string; person_id: string | null; one_on_one_id: string | null
          type: Database['public']['Enums']['report_type']; generated_by: string; storage_path: string
          params: Json; generated_at: string
        }
        Insert: {
          id?: string; organization_id: string; person_id?: string | null; one_on_one_id?: string | null
          type: Database['public']['Enums']['report_type']; generated_by: string; storage_path: string
          params?: Json; generated_at?: string
        }
        Update: {
          id?: string; organization_id?: string; person_id?: string | null; one_on_one_id?: string | null
          type?: Database['public']['Enums']['report_type']; generated_by?: string; storage_path?: string
          params?: Json; generated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'reports_person_id_fkey'; columns: ['person_id']; isOneToOne: false; referencedRelation: 'people'; referencedColumns: ['id'] },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      bootstrap_organization: {
        Args: { p_org_name: string }
        Returns: string
      }
      link_or_bootstrap_membership: {
        Args: { p_email: string; p_org_name: string }
        Returns: string
      }
      current_membership: {
        Args: { p_org: string }
        Returns: Database['public']['Enums']['membership_role'] | null
      }
      current_person_id: {
        Args: { p_org: string }
        Returns: string | null
      }
      create_person_with_initial_salary: {
        Args: {
          p_organization_id: string
          p_first_name: string
          p_last_name: string
          p_email: string
          p_phone: string | null
          p_position_title: string
          p_department_id: string | null
          p_manager_id: string | null
          p_hire_date: string
          p_contract_type: Database['public']['Enums']['contract_type']
          p_gross_annual_salary: number
          p_currency: string
        }
        Returns: Database['public']['Tables']['people']['Row']
      }
    }
    Enums: {
      membership_role: 'admin' | 'manager' | 'employee'
      employment_status: 'active' | 'on_leave' | 'offboarded'
      contract_type: 'indefinido' | 'temporal' | 'practicas' | 'freelance' | 'obra_y_servicio'
      salary_change_reason: 'hire' | 'review' | 'promotion' | 'market_adjustment' | 'correction'
      document_category: 'contract' | 'id_document' | 'review' | 'certificate' | 'other'
      audit_action: 'create' | 'update' | 'delete'
      note_visibility: 'manager_only' | 'admin_only'
      one_on_one_status: 'scheduled' | 'preparing' | 'in_progress' | 'completed' | 'cancelled'
      meeting_mode: 'in_person' | 'video' | 'phone'
      action_status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
      action_priority: 'low' | 'medium' | 'high' | 'urgent'
      goal_status: 'on_track' | 'at_risk' | 'off_track' | 'completed' | 'cancelled'
      training_status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
      feedback_visibility: 'manager_only' | 'shared_with_employee'
      time_off_type: 'vacation' | 'sick_leave' | 'other'
      report_type: 'one_on_one_pdf' | 'employee_summary' | 'employee_annual' | 'employee_full'
    }
  }
}
