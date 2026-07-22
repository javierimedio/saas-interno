-- Extensiones
create extension if not exists "pgcrypto" with schema extensions;

-- Enums necesarios para la vertical "Personas" (docs/03-modelo-datos.md §3.2).
-- Los enums de One2One/Acciones/Objetivos/Informes se añaden en sus propias verticales.
create type membership_role as enum ('admin', 'manager', 'employee');
create type employment_status as enum ('active', 'on_leave', 'offboarded');
create type contract_type as enum ('indefinido', 'temporal', 'practicas', 'freelance', 'obra_y_servicio');
create type salary_change_reason as enum ('hire', 'review', 'promotion', 'market_adjustment', 'correction');
create type document_category as enum ('contract', 'id_document', 'review', 'certificate', 'other');
create type audit_action as enum ('create', 'update', 'delete');
create type note_visibility as enum ('manager_only', 'admin_only');
