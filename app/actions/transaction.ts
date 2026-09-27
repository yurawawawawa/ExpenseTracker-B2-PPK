'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth/session'

type TransactionType = 'income' | 'expense'

async function getSessionUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

function serializeTransaction<T extends { amount: Prisma.Decimal }>(transaction: T) {
  return { ...transaction, amount: transaction.amount.toNumber() }
}

function validateTransactionInput(data: { amount?: number; type?: string; date?: Date }) {
  if (data.amount !== undefined && (!Number.isFinite(data.amount) || data.amount <= 0)) {
    throw new Error('Nominal tidak valid')
  }
  if (data.type !== undefined && data.type !== 'income' && data.type !== 'expense') {
    throw new Error('Jenis transaksi tidak valid')
  }
  if (data.date !== undefined && Number.isNaN(data.date.getTime())) {
    throw new Error('Tanggal tidak valid')
  }
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
  const user = await getSessionUser()
  validateTransactionInput(data)

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
    }
  })

  revalidatePath('/protected/dashboard')
  return { success: true, data: serializeTransaction(transaction) }
}


// ==========================================
// SRS-06 & SRS-09: Read, Sort, & Filter Transaction
// ==========================================
export async function getTransactions(options?: {
  filterType?: 'ALL' | TransactionType,
  sortOrder?: 'asc' | 'desc'
}) {
  const user = await getSessionUser()
  const filter = options?.filterType || 'ALL'
  const sort = options?.sortOrder || 'desc'

  const queryConditions: Prisma.TransactionWhereInput = { userId: user.id }

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

  return transactions.map(serializeTransaction)
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
  const user = await getSessionUser()
  validateTransactionInput(data)

  const result = await prisma.transaction.updateMany({
    where: { id: transactionId, userId: user.id },
    data,
  })
  if (result.count === 0) throw new Error('Transaksi tidak ditemukan atau akses ditolak')

  const updatedTx = await prisma.transaction.findFirstOrThrow({
    where: { id: transactionId, userId: user.id },
  })
  revalidatePath('/protected/dashboard')
  return { success: true, data: serializeTransaction(updatedTx) }
}


// ==========================================
// SRS-08: Delete Transaction
// ==========================================
export async function deleteTransaction(transactionId: string) {
  const user = await getSessionUser()
  const result = await prisma.transaction.deleteMany({
    where: { id: transactionId, userId: user.id },
  })
  if (result.count === 0) throw new Error('Transaksi tidak ditemukan atau akses ditolak')

  revalidatePath('/protected/dashboard')
  return { success: true }
}
