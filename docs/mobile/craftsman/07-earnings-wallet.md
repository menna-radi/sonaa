# Craftsman · Earnings, wallet & payouts

## 1. Backend contract (CRAFTSMAN role)

| Endpoint | Notes |
|---|---|
| `GET /craftsman/earnings` | `availableBalance, todayEarnings (legacy), todayCompletedWorkValue, completedWorkBusinessDate (YYYY-MM-DD), completedWorkTimeZone (Asia/Jerusalem), weeklyEarnings, monthlyEarnings, totalEarnings, pendingWithdrawal, earningsIncrease, sparkline[7], tipsTotal, transactions[]` |
| `GET /craftsman/wallet/balance` | balance |
| `GET /craftsman/wallet/transactions?page&limit` | paged history |
| `GET/POST/DELETE /craftsman/payout-accounts` | `{ type: BANK_ACCOUNT\|STC_PAY\|URPAY, accountHolderName, bankName?, accountNumber?, iban?, mobileNumber? }` |
| `POST /craftsman/withdraw` | deprecated (payments happen outside the app via Bit); validates `{ amount ≥ 50 ₪, payoutAccountId }` |

## 2. Rules
- Delete a payout account: `DELETE /craftsman/payout-accounts/:id`.
- **Today's earnings = sum of agreed prices of tasks completed today** in the business time zone
  (`todayCompletedWorkValue`). Display this, not the legacy `todayEarnings`.
- Weekly/monthly totals and the sparkline come from legacy transactions → may be 0 (known gap, see guide log).

## 3. Flow
Home card: today's value + sparkline → tap → earnings screen (tabs: overview / history) → payout accounts.

## 4. Caching
Today's value cached with its business date for instant paint; discarded when the date changes.

## 5. Test checklist
- [ ] Complete a 300 ₪ task → today shows 300 within one refresh.
- [ ] After midnight (Asia/Jerusalem) today resets to 0.
