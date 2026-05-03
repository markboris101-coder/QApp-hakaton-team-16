/** Маршруты, доступные до завершения стартовой анкеты (остаёмся на лендинге / якоря на нём). */
export function isOpenBeforeIntakeComplete(to: string): boolean {
  if (to === "/") return true;
  if (to.startsWith("/#")) return true;
  return false;
}
