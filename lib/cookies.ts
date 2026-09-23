export function getBalanceVisibility(): 'show' | 'hide' {
  const match = document.cookie.match(/(?:^|; )balance_visibility=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === 'hide' ? 'hide' : 'show'; // default show
}

export function setBalanceVisibility(value: 'show' | 'hide'): void {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1); // 1 year
  document.cookie = `balance_visibility=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}
