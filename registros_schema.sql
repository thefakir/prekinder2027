-- ============================================================
-- Prekínder Bolivia 2027 — Esquema de la tabla "registros"
-- ============================================================
-- Correr completo en el SQL Editor de Supabase (Dashboard > SQL Editor > New query).
-- Si la tabla ya existe y quieres reconstruirla desde cero, el DROP de abajo
-- borra TODOS los datos actuales de forma permanente. Descomenta esa línea
-- solo si estás seguro.

-- drop table if exists public.registros;

create table public.registros (
  id                bigint generated always as identity primary key,
  nombre            text not null,
  contacto          text not null,           -- WhatsApp o email, normalizado en minúsculas sin espacios
  departamento      text,                     -- departamento de residencia
  ciudad            text,
  relacion          text,                     -- padre-madre | familiar | amigo-aliado | ya-paso
  mes_nacimiento    text,                     -- enero..junio, solo si relacion = padre-madre o familiar
  ci                text not null,            -- solo dígitos
  ci_expedido       text not null,            -- departamento donde se expidió el CI
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  created_at        timestamptz not null default now(),

  -- (ci, ci_expedido) juntos, no ci solo: bajo el sistema antiguo de carnets,
  -- el mismo número podía repetirse en distintos departamentos y ser personas distintas.
  constraint registros_ci_unique unique (ci, ci_expedido),
  constraint registros_contacto_unique unique (contacto)
);

-- Row Level Security: sin esto, cualquiera con la Publishable key podría
-- leer/editar/borrar toda la tabla. Con RLS activado y solo una policy de
-- INSERT, el sitio público únicamente puede agregar filas nuevas.
alter table public.registros enable row level security;

create policy "permitir_insert_publico"
on public.registros
for insert
to anon
with check (true);

-- Nota: no se crea ninguna policy de SELECT/UPDATE/DELETE para "anon" a propósito.
-- Los datos (incluido el CI) solo se pueden leer entrando al Table Editor con tu cuenta.
