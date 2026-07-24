-- Evolución del One2One hacia plantillas por bloques (docs/product-design/02-user-experience.md §2.4,
-- ya anticipado y aplazado). Las plantillas y el catálogo de bloques viven en código (mismo criterio
-- que CONTRACT_TYPE/ACTION_STATUS): aquí solo se guarda qué plantilla se usó y el contenido narrativo
-- de la reunión. Todo lo que ya tenía entidad propia (acciones, valoración, próxima fecha) se queda
-- donde estaba — el JSON aloja únicamente lo nuevo.
alter table one_on_ones add column template_key text not null default 'periodic_follow_up';
alter table one_on_ones add column meeting_data jsonb not null default '{"version": 1, "blocks": {}}';

-- overall_rating ya era nullable a nivel de base de datos; la obligatoriedad vivía solo en el
-- esquema Zod de cierre, que pasa a marcarla opcional (sin cambios de esquema aquí).
