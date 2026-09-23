import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Transaction } from '@/lib/types';

/** Helper to get current user id; throws if not authenticated */
async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthenticated');
  }
  return user.id;
}

/** GET /api/transactions – list user's transactions */
export async function GET() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return NextResponse.json({ transactions: data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

/** POST /api/transactions – create a new transaction for the user */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body: Partial<Transaction> = await request.json();
    const payload = { ...body, user_id: userId };
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('transactions')
      .insert([payload]);
    if (error) throw error;
    return NextResponse.json({ transaction: data?.[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** PUT /api/transactions/:id – update a transaction if it belongs to the user */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    if (!id) throw new Error('Missing transaction id');
    const updates: Partial<Transaction> = await request.json();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return NextResponse.json({ transaction: data?.[0] });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** DELETE /api/transactions/:id – delete a transaction if it belongs to the user */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    if (!id) throw new Error('Missing transaction id');
    const supabase = await createClient();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return new NextResponse('', { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
