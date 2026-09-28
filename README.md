# Expense Tracker

Aplikasi manajemen keuangan pribadi untuk mencatat pemasukan dan pengeluaran, memantau saldo, serta mengatur budget bulanan. Data transaksi, budget, dan akun dipisahkan berdasarkan pengguna yang sedang login.

## Fitur

- Registrasi, login, logout, dan sesi pengguna berbasis cookie.
- Dashboard ringkasan keuangan dengan saldo dan transaksi terbaru.
- Pengelolaan transaksi pemasukan dan pengeluaran.
- Filter transaksi berdasarkan tipe, kategori, tanggal, atau bulan.
- Pengaturan budget per bulan dan pemantauan pemakaiannya.
- API yang melindungi data berdasarkan pengguna yang terautentikasi.

## Teknologi

- Next.js App Router, React, dan TypeScript
- PostgreSQL dengan `pg` untuk query aplikasi
- Prisma Client untuk akses skema/generasi client
- Tailwind CSS dan komponen Radix UI
- Vitest dan ESLint

## Persiapan

Pastikan Node.js, npm, dan database PostgreSQL tersedia. Clone repository, masuk ke direktori proyek, lalu pasang dependency:

```bash
npm install
```

Buat file `.env.local` di root proyek. Contoh konfigurasi berikut memakai PostgreSQL lokal; sesuaikan nilai koneksi dengan lingkungan Anda:

```env
# Koneksi aplikasi dan Prisma
DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_tracker?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/expense_tracker?schema=public"

# Secret untuk hashing token sesi; gunakan nilai acak yang kuat
SESSION_SECRET="ganti-dengan-secret-acak-yang-panjang"

# Opsional: masa berlaku sesi dalam detik (default 604800 / 7 hari)
SESSION_MAX_AGE_SECONDS="604800"

# Dipakai oleh budget seeder
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="expense_tracker"
DB_USERNAME="postgres"
DB_PASSWORD="password"
DB_SSL="false"
```

Aplikasi menerima koneksi database melalui salah satu cara berikut:

- `DATABASE_URL` sebagai connection string PostgreSQL; atau
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD`, dengan `DB_PORT` opsional (default `5432`).

Untuk Prisma, `DATABASE_URL` dan `DIRECT_URL` perlu menunjuk ke database yang sesuai. Seeder `npm run seed:budget` memakai variabel `DB_*` di atas, sehingga tetap memerlukan konfigurasi tersebut meskipun aplikasi memakai `DATABASE_URL`.

## Menyiapkan Database

Jalankan SQL berikut pada database PostgreSQL yang sama dengan konfigurasi aplikasi, misalnya melalui `psql` atau SQL editor penyedia database. Jalankan berurutan:

1. `db/migrations/001_create_auth_tables.sql`
2. `db/migrations/002_create_transactions.sql`
3. `db/migrations/003_create_budgets.sql`

File `001_create_users.sql` hanya membuat tabel `users` dan merupakan definisi users-only yang redundan untuk setup baru; gunakan `001_create_auth_tables.sql` agar tabel `sessions` juga tersedia.

Migrasi dalam repository ini berupa file SQL; belum ada perintah migrasi otomatis pada `package.json`.

## Menjalankan Aplikasi

Setelah konfigurasi dan database siap:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman awal mengarahkan pengguna ke halaman login. Buat akun melalui halaman registrasi sebelum menggunakan dashboard.

Perintah lain yang tersedia:

```bash
npm run build       # Build untuk production
npm run start       # Jalankan build production
npm run lint        # Jalankan ESLint
npm test            # Jalankan test dengan Vitest
npm run seed:budget # Isi data contoh budget dan transaksi
npm run seed:user   # Isi data user
```

Seeder membutuhkan setidaknya satu akun yang sudah terdaftar. Seeder memilih akun yang dibuat paling awal dan menambahkan data contoh untuk bulan Januari hingga September 2026. Periksa database sebelum menjalankannya, terutama pada lingkungan yang berisi data nyata.

## Endpoint API

Endpoint berikut memerlukan sesi login kecuali endpoint autentikasi:

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Membuat akun |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/transactions` | Mengambil transaksi; mendukung filter `type`, `category`, `date` (`YYYY-MM-DD`), atau `month` (`YYYY-MM`) |
| `POST` | `/api/transactions` | Membuat transaksi |
| `PUT` | `/api/transactions?id=<uuid>` | Memperbarui transaksi |
| `DELETE` | `/api/transactions?id=<uuid>` | Menghapus transaksi |
| `GET` | `/api/budgets` | Mengambil seluruh budget, atau satu budget dengan parameter `month` dan `year` |
| `POST` | `/api/budgets` | Membuat atau memperbarui budget bulanan |
| `DELETE` | `/api/budgets?id=<uuid>` | Menghapus budget |

Endpoint API menerima dan mengembalikan JSON. Endpoint yang memerlukan sesi mengembalikan status `401` bila pengguna belum login.

## Struktur Proyek

```text
app/                  Halaman, route handler API, dan server actions
components/           Komponen UI dan dashboard
db/migrations/        SQL untuk tabel akun, sesi, transaksi, dan budget
db/seeders/           Seeder data contoh
lib/auth/             Registrasi, autentikasi, dan pengelolaan sesi
lib/                  Akses database, validasi, format, dan tipe data
prisma/schema.prisma  Skema Prisma
```

## Catatan Keamanan

- Simpan `.env.local` dan secret database di luar version control; jangan memasukkan kredensial asli ke repository.
- Gunakan `SESSION_SECRET` yang acak dan kuat, khususnya untuk deployment production.
- Pastikan akses database dibatasi dan gunakan koneksi SSL sesuai konfigurasi penyedia PostgreSQL.
- Operasi transaksi dan budget dibatasi pada data milik pengguna yang sedang login.