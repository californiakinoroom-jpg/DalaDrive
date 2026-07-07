-- Схема БД для онлайн-записи DALA DRIVE
-- Выполнить в Supabase → SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  date          date        not null,
  start_time    text        not null,          -- "07:00"
  end_time      text        not null,          -- "08:50"
  student_name  text        not null,
  phone         text        not null,
  comment       text,
  status        text        not null default 'active',  -- active | cancelled | attended | no_show
  cancel_token  uuid        not null default gen_random_uuid(),
  created_at    timestamptz not null default now()
);

-- Один инструктор -> на одно (дата, время) только одна АКТИВНАЯ запись.
-- Частичный уникальный индекс: отменённые не блокируют повторную запись.
create unique index if not exists bookings_slot_unique
  on bookings (date, start_time)
  where status = 'active';

create index if not exists bookings_date_idx on bookings (date);

-- RLS включаем, но доступ идёт через service_role (сервер), поэтому
-- публичных политик не создаём. Клиент никогда не ходит в БД напрямую.
alter table bookings enable row level security;
