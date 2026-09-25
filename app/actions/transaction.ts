'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma' // Pastikan file lib/prisma.ts sudah ada nanti
import { Prisma, TransactionType } from '@prisma/client'

// --- DUMMY AUTH (SESUAIKAN DENGAN PROJECT KELOMPOKMU NANTI) ---
// Supaya SRS (otomatis dikaitkan dengan user yang sedang login) terpenuhi
async function getSessionUser() {
  const userId = "user-123-dummy" // Nanti ganti pakai session dari Supabase Auth / NextAuth
  if (!userId) throw new Error("Unauthorized")
  return userId
}

// ==========================================
// SRS-05: Create Transaction
// ==========================================
export async function createTransaction(data: {
  type: TransactionType
  amount: number
  description: string
  date: Date
}) {
  const userId = await getSessionUser()

  if (data.amount <= 0) throw new Error("Nominal harus lebih dari 0")

  const transaction = await prisma.transaction.create({
    data: {
      userId,           // Otomatis terikat dengan user yang login
      type: data.type,  // Tipe ter-restrict hanya INCOME/EXPENSE oleh skema database
      amount: data.amount,
      description: data.description,
      date: data.date,
    }
  })

  revalidatePath('/transactions') // Refresh cache halaman agar data baru muncul
  return { success: true, data: transaction }
}


// ==========================================
// SRS-06 & SRS-09: Read, Sort, & Filter Transaction
// ==========================================
export async function getTransactions(options?: {
  filterType?: 'ALL' | TransactionType,
  sortOrder?: 'asc' | 'desc'
}) {
  const userId = await getSessionUser()
  const filter = options?.filterType || 'ALL'
  const sort = options?.sortOrder || 'desc'

  // SRS-06: Hanya transaksi milik user yang ditampilkan
  const queryConditions: Prisma.TransactionWhereInput = { userId }

  // SRS-09: Filter berdasarkan jenis transaksi
  if (filter !== 'ALL') {
    queryConditions.type = filter
  }

  const transactions = await prisma.transaction.findMany({
    where: queryConditions,
    orderBy: {
      date: sort // SRS-06: Diurutkan berdasarkan tanggal
    },
    select: {
      id: true,
      date: true,
      description: true,
      type: true,
      amount: true,
    }
  })

  return transactions
}


// ==========================================
// SRS-07: Update Transaction
// ==========================================
export async function updateTransaction(
  transactionId: string,
  data: {
    type?: TransactionType
    amount?: number
    description?: string
    date?: Date
  }
) {
  const userId = await getSessionUser()

  // Pastikan data milik user yang sedang login
  const existingTx = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!existingTx || existingTx.userId !== userId) {
    throw new Error("Transaksi tidak ditemukan atau akses ditolak")
  }

  if (data.amount !== undefined && data.amount <= 0) {
    throw new Error("Nominal tidak valid")
  }

  const updatedTx = await prisma.transaction.update({
    where: { id: transactionId },
    data
  })

  revalidatePath('/transactions')
  return { success: true, data: updatedTx }
}


// ==========================================
// SRS-08: Delete Transaction
// ==========================================
export async function deleteTransaction(transactionId: string) {
  const userId = await getSessionUser()

  // Validasi kepemilikan
  const existingTx = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!existingTx || existingTx.userId !== userId) {
    throw new Error("Transaksi tidak ditemukan atau akses ditolak")
  }

  await prisma.transaction.delete({
    where: { id: transactionId }
  })

  revalidatePath('/transactions')
  return { success: true }
}
