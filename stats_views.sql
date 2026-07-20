-- ============================================================
-- Prekínder Bolivia 2027 — Vistas de estadísticas agregadas
-- ============================================================
-- Correr en el SQL Editor de Supabase. Estas vistas SOLO devuelven
-- conteos agrupados — nunca nombre, CI, contacto ni ninguna fila
-- individual. La tabla base "registros" sigue sin política de
-- lectura pública; estas vistas son la única puerta de lectura,
-- y esa puerta solo deja pasar números.

create view public.stats_total as
  select count(*)::int as total
  from public.registros;

create view public.stats_departamento as
  select departamento, count(*)::int as total
  from public.registros
  where departamento is not null and departamento <> ''
  group by departamento;

create view public.stats_relacion as
  select relacion, count(*)::int as total
  from public.registros
  where relacion is not null and relacion <> ''
  group by relacion;

create view public.stats_mes as
  select mes_nacimiento, count(*)::int as total
  from public.registros
  where mes_nacimiento is not null and mes_nacimiento <> ''
  group by mes_nacimiento;

-- Solo lectura pública de las vistas de arriba, nunca de la tabla base.
grant select on public.stats_total to anon;
grant select on public.stats_departamento to anon;
grant select on public.stats_relacion to anon;
grant select on public.stats_mes to anon;
