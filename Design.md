# DESIGN.md

# Expand Tracker
## UI/UX Design System & Development Guideline

Version: 1.0

Project:
Expand Tracker - Personal Finance Management Application

Framework:
Next.js


---

# 1. Project Overview

Expand Tracker adalah aplikasi manajemen keuangan pribadi yang membantu mahasiswa mengelola pemasukan, pengeluaran, saldo, transaksi, dan budget bulanan.

Fitur utama:

- Register akun
- Login menggunakan email dan password
- Session management
- Protected authentication
- Dashboard keuangan
- Transaction management
- Transaction filtering
- Monthly budget management
- Budget monitoring

Prinsip utama:

Setiap data harus terhubung dengan user yang sedang login.

User hanya dapat:
- Melihat data miliknya.
- Mengubah data miliknya.
- Menghapus data miliknya.


---

# 2. Design Concept

Nama Design:

Simple Blue Financial Dashboard


Konsep:

- Modern fintech application
- Minimalist
- Clean
- Professional
- Student friendly


Tujuan:

Memberikan pengalaman aplikasi finansial modern dengan tampilan sederhana, jelas, dan mudah digunakan.


---

# 3. Color System


## Primary Color

Blue

```
#2563EB
```

Digunakan untuk:
- Primary button
- Active menu
- Highlight
- Header


## Secondary Color

Light Blue

```
#DBEAFE
```

Digunakan untuk:
- Background card
- Badge
- Secondary button


## Background

Main:

```
#F8FAFC
```

Card:

```
#FFFFFF
```


## Text

Primary:

```
#0F172A
```

Secondary:

```
#64748B
```


## Status Color

Income:

```
#16A34A
```

Expense:

```
#DC2626
```

Warning:

```
#EAB308
```


---

# 4. Typography


Font:

Inter / Poppins


Heading:

H1:
32px Bold


H2:
24px Semi Bold


H3:
20px Semi Bold


Body:

16px Regular


Small:

14px


---

# 5. Layout System


## Desktop Layout

```
--------------------------------
| Sidebar | Main Content        |
|         |                     |
--------------------------------
```


Sidebar Width:

240px


Menu:

- Dashboard
- Transactions
- Budget
- Profile
- Logout


---

## Mobile Layout

Gunakan:

- Bottom navigation
- Hamburger menu
- Vertical card layout


Semua halaman wajib responsive.


---

# 6. Component Design Rules


Gunakan:

- Rounded card
- Soft shadow
- Clear spacing
- Simple icon


Border radius:

Card:

16px


Button:

10px


Input:

8px


Shadow:

Soft shadow, tidak terlalu berat.


---

# 7. Dashboard UI


Dashboard merupakan halaman utama setelah user login.


## Header

Menampilkan:

```
Hello, User

Manage your money better today
```


Berisi:

- Nama user
- Greeting
- Profile


---

## Balance Card


Menampilkan:

```
Current Balance

Rp5.000.000
```


Style:

- Background biru
- Text putih
- Nominal besar


---

## Financial Summary


Menampilkan:


Income:

```
Rp8.000.000
```


Expense:

```
Rp3.000.000
```


---

## Recent Transaction


Format:


```
Food

Lunch

- Rp25.000

28 September 2026
```


---

# 8. Budget Management UI


## Budget Summary


Menampilkan:


```
Monthly Budget

Rp2.000.000


Spent

Rp1.200.000


Remaining

Rp800.000
```


---

## Budget Indicator


Format:


```
Budget Usage


████████░░


70%


Status:
AMAN
```


Status:


0-70%

AMAN


71-90%

PERHATIAN


>100%

TERLAMPUI


---

## Budget Alert


Jika budget terlampaui:


```
Warning!

Your expense has exceeded your monthly budget.
```


Gunakan:
- Alert card
- Notification


---

# 9. Transaction UI


## Transaction List


Format:


```
Category

Description

Amount

Date
```


---

## Transaction Type


Income:

```
+ Rp500.000
```

Warna:

Hijau


Expense:

```
- Rp50.000
```

Warna:

Merah


---

# 10. Transaction Filter


Gunakan:


```
All

Income

Expense
```


Tambahkan:

Month Selector


Contoh:


```
September 2026
```


---

# 11. Form Design


## Transaction Form


Field:

- Type
- Category
- Amount
- Date
- Description


Button:

```
Save Transaction
```


---

## Budget Form


Field:

- Month
- Year
- Budget Amount


Button:

```
Save Budget
```


---

# 12. Loading & Error State


Semua proses API wajib memiliki:


Loading:

```
Loading data...
```


Gunakan:

- Skeleton
- Spinner


Empty state:


```
No transaction found
```


Error:


```
Something went wrong.
Please try again.
```


---

# 13. Component Structure


Gunakan struktur:


```
components/

dashboard/

- BalanceCard
- SummaryCard
- BudgetCard
- RecentTransaction


transaction/

- TransactionList
- TransactionForm
- TransactionFilter


budget/

- BudgetSummary
- BudgetIndicator
- BudgetForm


ui/

- Button
- Card
- Input
- Modal
```


---

# 14. API Rules


Semua API wajib:

- Menggunakan session user.
- Validasi input.
- Error handling.


Endpoint:


```
GET /api/transaction

GET /api/budget

POST /api/budget

PUT /api/budget/:id

DELETE /api/budget/:id
```


---

# 15. Database Rules


Relasi:


```
User

|

|---- Transactions

|

|---- Budgets
```


Semua query wajib:


```
WHERE user_id = current_user
```


Dilarang:

- Mengambil semua data user.
- Membuka akses antar akun.


---

# 16. Seeder Rules


Seeder wajib dibuat untuk testing.


Budget Seeder:


Contoh:


```
User:
Demo User


Budget:

January 2026
Rp2.000.000


February 2026
Rp1.500.000
```


Transaction Seeder:


Contoh:


```
Food
Rp500.000


Transport
Rp300.000


Shopping
Rp700.000
```


Ketentuan:

- Menggunakan firstOrCreate/updateOrCreate.
- Tidak membuat duplicate data.
- Tidak digunakan pada production.


---

# 17. Programmer Work Separation


## Programmer 1

Focus:

Budget Management + Dashboard Enhancement


Mengelola:


```
components/budget

components/dashboard/budget

api/budget

seeders/budget
```


Tugas:

- Set Budget
- Budget Summary
- Budget Indicator
- Monthly Budget
- Budget Alert
- Budget API
- Seeder Budget
- Dashboard Budget Integration


Tidak boleh mengubah:

- Authentication core
- Transaction core


---

## Programmer 2


Focus:

Authentication + Transaction Management


Mengelola:


```
components/auth

components/transaction

api/auth

api/transaction

middleware
```


Tugas:

- Register
- Login
- Session
- Cookies
- Logout
- Protected Route
- CRUD Transaction
- Transaction Filter
- Security Testing


Tidak boleh mengubah:

- Budget Module


---

# 18. Git Collaboration Rules


Sebelum coding:


```
git pull origin main
```


Commit format:


Feature:

```
feat: add monthly budget
```


Fix:

```
fix: repair transaction filter
```


UI:

```
style: update dashboard design
```


---

# 19. Development Rules


WAJIB:

✓ Clean code  
✓ Reusable component  
✓ Responsive design  
✓ Validation  
✓ Error handling  
✓ Consistent UI  


DILARANG:

✗ Hardcode data  
✗ Duplicate component  
✗ Mengubah area programmer lain  
✗ Membuat struktur baru tanpa alasan  


---

# 20. Testing Checklist


Authentication:

[ ] Register berhasil

[ ] Login berhasil

[ ] Session tersimpan

[ ] Logout berhasil


Transaction:

[ ] Tambah transaksi

[ ] Edit transaksi

[ ] Hapus transaksi

[ ] Filter berjalan


Budget:

[ ] Set budget

[ ] Summary benar

[ ] Indicator benar

[ ] Alert muncul ketika over budget


Security:

[ ] User hanya melihat data sendiri

[ ] Tidak ada akses antar user


---

# 21. Final Quality Target


Expand Tracker harus memiliki:


✓ UI fintech modern

✓ Tema biru konsisten

✓ Dashboard informatif

✓ Transaction management lengkap

✓ Budget monitoring

✓ Secure authentication

✓ Responsive mobile

✓ Clean architecture


End of Design Guideline