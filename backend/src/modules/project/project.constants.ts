export const PLATFORM_ROLES = [
  { key: "guest", label: "Гість", scope: "public" },
  { key: "user", label: "Користувач", scope: "self" },
  { key: "partner_owner", label: "Власник партнера", scope: "organization" },
  { key: "partner_manager", label: "Менеджер партнера", scope: "place" },
  { key: "partner_cashier", label: "Працівник / касир", scope: "place_or_shift" },
  { key: "ambassador", label: "Амбасадор", scope: "campaign" },
  { key: "regional_admin", label: "Регіональний адмін", scope: "region" },
  { key: "finance_operator", label: "Фінансовий оператор", scope: "finance" },
  { key: "moderator", label: "Модератор", scope: "moderation_queue" },
  { key: "superadmin", label: "Суперадмін", scope: "platform" },
] as const;

export const STAGE_ONE_MODULES = [
  { key: "tourist", label: "Telegram Mini App", screens: 16 },
  { key: "partner", label: "Партнерський кабінет", screens: 8 },
  { key: "ambassador", label: "Кабінет амбасадора", screens: 2 },
  { key: "regional", label: "Регіональна адмінка", screens: 3 },
  { key: "admin", label: "Головна адмінка", screens: 7 },
] as const;

export const CORE_FLOWS = [
  "qr_context_and_customer_confirmation",
  "multi_resource_booking",
  "bonus_wallet_state_machine",
  "immutable_financial_ledger",
] as const;
