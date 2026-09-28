/**
 * ============================================================
 * Database Seeder — Budget Management & Supporting Transactions
 * ============================================================
 *
 * Seeder ini membuat dummy data untuk testing fitur Budget Management:
 *   - Budget bulanan (Jan–Sep 2026)
 *   - Transaksi pengeluaran & pemasukan pendukung
 *
 * Fitur keamanan:
 *   - Menggunakan user EXISTING dari tabel users (tidak membuat user baru)
 *   - Idempotent: aman dijalankan berulang kali (ON CONFLICT = upsert/skip)
 *   - Hanya untuk environment development/testing
 *
 * Cara menjalankan:
 *   node db/seeders/budget-seeder.js
 */

require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");

// ─── Database Connection ───────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
});

// ─── Dummy Budget Data ─────────────────────────────────────────
const BUDGET_DATA = [
  { month: 1, year: 2026, amount: 2000000 },  // Januari
  { month: 2, year: 2026, amount: 1500000 },  // Februari
  { month: 3, year: 2026, amount: 3000000 },  // Maret
  { month: 4, year: 2026, amount: 2500000 },  // April
  { month: 5, year: 2026, amount: 2000000 },  // Mei
  { month: 6, year: 2026, amount: 1800000 },  // Juni
  { month: 7, year: 2026, amount: 2200000 },  // Juli
  { month: 8, year: 2026, amount: 2000000 },  // Agustus
  { month: 9, year: 2026, amount: 2500000 },  // September (bulan aktif)
];

// ─── Dummy Transaction Data ────────────────────────────────────
// Dibuat untuk beberapa bulan agar budget indicator bisa diuji
// dengan berbagai status: Aman, Mendekati Batas, Melebihi Budget
const TRANSACTION_DATA = [
  // === JANUARI 2026 — Status: AMAN (75% usage) ===
  // Budget: Rp2.000.000 | Expense: Rp1.500.000
  { type: "income",  amount: 5000000, description: "Uang bulanan",         category: "Transfer",   date: "2026-01-02" },
  { type: "expense", amount: 500000,  description: "Makan sebulan",         category: "Makanan",    date: "2026-01-05" },
  { type: "expense", amount: 300000,  description: "Transport kampus",      category: "Transport",  date: "2026-01-10" },
  { type: "expense", amount: 700000,  description: "Belanja kebutuhan",     category: "Belanja",    date: "2026-01-15" },

  // === FEBRUARI 2026 — Status: MELEBIHI BUDGET (120% usage) ===
  // Budget: Rp1.500.000 | Expense: Rp1.800.000
  { type: "income",  amount: 4000000, description: "Uang bulanan",          category: "Transfer",   date: "2026-02-01" },
  { type: "expense", amount: 600000,  description: "Makan & jajan",         category: "Makanan",    date: "2026-02-05" },
  { type: "expense", amount: 450000,  description: "Beli buku kuliah",      category: "Pendidikan", date: "2026-02-10" },
  { type: "expense", amount: 350000,  description: "Ongkos transport",      category: "Transport",  date: "2026-02-15" },
  { type: "expense", amount: 400000,  description: "Belanja online",        category: "Belanja",    date: "2026-02-20" },

  // === MARET 2026 — Status: AMAN (50% usage) ===
  // Budget: Rp3.000.000 | Expense: Rp1.500.000
  { type: "income",  amount: 5000000, description: "Uang bulanan",          category: "Transfer",   date: "2026-03-01" },
  { type: "expense", amount: 450000,  description: "Makan di kantin",       category: "Makanan",    date: "2026-03-05" },
  { type: "expense", amount: 250000,  description: "Grab/Gojek",            category: "Transport",  date: "2026-03-10" },
  { type: "expense", amount: 500000,  description: "Beli pulsa & paket",    category: "Utilitas",   date: "2026-03-15" },
  { type: "expense", amount: 300000,  description: "Nonton & hiburan",      category: "Hiburan",    date: "2026-03-22" },

  // === APRIL 2026 — Status: MENDEKATI BATAS (88% usage) ===
  // Budget: Rp2.500.000 | Expense: Rp2.200.000
  { type: "income",  amount: 4500000, description: "Uang bulanan",          category: "Transfer",   date: "2026-04-01" },
  { type: "expense", amount: 600000,  description: "Makan & kopi",          category: "Makanan",    date: "2026-04-04" },
  { type: "expense", amount: 500000,  description: "Bayar kos bulanan",     category: "Tempat Tinggal", date: "2026-04-05" },
  { type: "expense", amount: 400000,  description: "Transport Grab",        category: "Transport",  date: "2026-04-12" },
  { type: "expense", amount: 350000,  description: "Beli alat tulis",       category: "Pendidikan", date: "2026-04-18" },
  { type: "expense", amount: 350000,  description: "Belanja mingguan",      category: "Belanja",    date: "2026-04-25" },

  // === SEPTEMBER 2026 (bulan aktif) — Status: AMAN (60% usage) ===
  // Budget: Rp2.500.000 | Expense: Rp1.500.000
  { type: "income",  amount: 5000000, description: "Uang bulanan September", category: "Transfer",  date: "2026-09-01" },
  { type: "expense", amount: 500000,  description: "Makan & snack",          category: "Makanan",   date: "2026-09-03" },
  { type: "expense", amount: 300000,  description: "Transport ke kampus",    category: "Transport", date: "2026-09-08" },
  { type: "expense", amount: 400000,  description: "Beli kebutuhan kuliah",  category: "Pendidikan", date: "2026-09-15" },
  { type: "expense", amount: 300000,  description: "Belanja bulanan",        category: "Belanja",   date: "2026-09-20" },
];

// ─── Color helpers for console output ──────────────────────────
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Main Seeder Function ──────────────────────────────────────
async function seed() {
  const client = await pool.connect();

  try {
    console.log("\n" + c.bold("═══════════════════════════════════════════════"));
    console.log(c.bold("  🌱 Budget Management Seeder"));
    console.log(c.bold("═══════════════════════════════════════════════\n"));

    // ── Step 1: Find existing user ──────────────────────────────
    console.log(c.cyan("📋 Step 1: Mencari user existing..."));

    const userResult = await client.query(
      "SELECT id, name, email FROM users ORDER BY created_at ASC LIMIT 1"
    );

    if (userResult.rows.length === 0) {
      console.log(c.red("\n❌ Tidak ada user di database!"));
      console.log(c.yellow("   Silakan register terlebih dahulu melalui aplikasi."));
      console.log(c.dim("   URL: http://localhost:3000/auth/register\n"));
      return;
    }

    const user = userResult.rows[0];
    console.log(c.green(`   ✓ User ditemukan: ${user.name} (${user.email})`));
    console.log(c.dim(`   ID: ${user.id}\n`));

    // ── Step 2: Seed Budget Data ────────────────────────────────
    console.log(c.cyan("💰 Step 2: Seeding budget data..."));

    let budgetInserted = 0;
    let budgetUpdated = 0;

    for (const budget of BUDGET_DATA) {
      const result = await client.query(
        `INSERT INTO budgets (user_id, month, year, amount)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, month, year)
         DO UPDATE SET amount = $4, updated_at = NOW()
         RETURNING (xmax = 0) AS is_insert`,
        [user.id, budget.month, budget.year, budget.amount]
      );

      const isInsert = result.rows[0]?.is_insert;
      if (isInsert) {
        budgetInserted++;
      } else {
        budgetUpdated++;
      }

      const status = isInsert ? c.green("INSERT") : c.yellow("UPDATE");
      console.log(
        `   ${status}  ${MONTH_NAMES[budget.month - 1]} ${budget.year} → ${formatRupiah(budget.amount)}`
      );
    }

    console.log(
      c.dim(`   Hasil: ${budgetInserted} inserted, ${budgetUpdated} updated\n`)
    );

    // ── Step 3: Seed Transaction Data ───────────────────────────
    console.log(c.cyan("📝 Step 3: Seeding transaction data..."));

    let txInserted = 0;
    let txSkipped = 0;

    for (const tx of TRANSACTION_DATA) {
      // Check if transaction with same description + date + user already exists
      const existing = await client.query(
        `SELECT id FROM transactions 
         WHERE user_id = $1 AND description = $2 AND date = $3 AND type = $4 AND amount = $5
         LIMIT 1`,
        [user.id, tx.description, tx.date, tx.type, tx.amount]
      );

      if (existing.rows.length > 0) {
        txSkipped++;
        console.log(
          `   ${c.dim("SKIP")}    ${tx.date} | ${tx.type === "income" ? c.green("income ") : c.red("expense")} | ${formatRupiah(tx.amount).padStart(15)} | ${tx.description}`
        );
        continue;
      }

      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description, category, date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, tx.type, tx.amount, tx.description, tx.category, tx.date]
      );

      txInserted++;
      console.log(
        `   ${c.green("INSERT")}  ${tx.date} | ${tx.type === "income" ? c.green("income ") : c.red("expense")} | ${formatRupiah(tx.amount).padStart(15)} | ${tx.description}`
      );
    }

    console.log(
      c.dim(`   Hasil: ${txInserted} inserted, ${txSkipped} skipped\n`)
    );

    // ── Step 4: Verification ────────────────────────────────────
    console.log(c.cyan("✅ Step 4: Verifikasi data...\n"));

    // Verify budgets
    const budgets = await client.query(
      `SELECT month, year, amount FROM budgets 
       WHERE user_id = $1 ORDER BY year, month`,
      [user.id]
    );

    console.log(c.bold("   📊 Budget Summary:"));
    console.log("   ┌──────────────────────────┬──────────────────┐");
    console.log("   │ Bulan                    │ Budget           │");
    console.log("   ├──────────────────────────┼──────────────────┤");
    for (const b of budgets.rows) {
      const name = `${MONTH_NAMES[b.month - 1]} ${b.year}`.padEnd(24);
      const amt = formatRupiah(Number(b.amount)).padStart(16);
      console.log(`   │ ${name} │ ${amt} │`);
    }
    console.log("   └──────────────────────────┴──────────────────┘\n");

    // Verify budget vs expense per month
    console.log(c.bold("   📈 Budget vs Pengeluaran:"));
    console.log("   ┌──────────────────────────┬──────────────────┬──────────────────┬──────────┬──────────────┐");
    console.log("   │ Bulan                    │ Budget           │ Pengeluaran      │ Persen   │ Status       │");
    console.log("   ├──────────────────────────┼──────────────────┼──────────────────┼──────────┼──────────────┤");

    for (const b of budgets.rows) {
      const expResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
         WHERE user_id = $1 AND type = 'expense'
         AND EXTRACT(MONTH FROM date) = $2
         AND EXTRACT(YEAR FROM date) = $3`,
        [user.id, b.month, b.year]
      );

      const expense = Number(expResult.rows[0].total);
      const budgetAmt = Number(b.amount);
      const pct = budgetAmt > 0 ? (expense / budgetAmt) * 100 : 0;

      let status;
      if (pct >= 100) status = c.red("🔴 Melebihi ");
      else if (pct >= 80) status = c.yellow("🟡 Mendekati ");
      else status = c.green("🟢 Aman      ");

      const name = `${MONTH_NAMES[b.month - 1]} ${b.year}`.padEnd(24);
      const bAmt = formatRupiah(budgetAmt).padStart(16);
      const eAmt = formatRupiah(expense).padStart(16);
      const pStr = `${pct.toFixed(1)}%`.padStart(8);

      console.log(`   │ ${name} │ ${bAmt} │ ${eAmt} │ ${pStr} │ ${status}│`);
    }
    console.log("   └──────────────────────────┴──────────────────┴──────────────────┴──────────┴──────────────┘\n");

    // Final summary
    console.log(c.bold("═══════════════════════════════════════════════"));
    console.log(c.green(c.bold("  ✅ Seeder berhasil dijalankan!")));
    console.log(c.bold("═══════════════════════════════════════════════"));
    console.log(c.dim(`  User    : ${user.name} (${user.email})`));
    console.log(c.dim(`  Budget  : ${budgets.rows.length} records`));
    console.log(c.dim(`  Transaksi: ${txInserted} inserted, ${txSkipped} skipped`));
    console.log(c.dim(`\n  Buka dashboard: http://localhost:3000/protected/dashboard\n`));

  } catch (error) {
    console.error(c.red("\n❌ Seeder gagal:"), error.message);
    console.error(c.dim(error.stack));
  } finally {
    client.release();
    await pool.end();
  }
}

// ─── Run ────────────────────────────────────────────────────────
seed();
