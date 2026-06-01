import { NextRequest, NextResponse } from 'next/server';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  checkout,
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/commerceController';

export async function GET_products(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId') as string;
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || undefined;

  if (searchParams.get('id')) {
    const product = await getProduct(searchParams.get('id')!);
    return NextResponse.json(product);
  }

  return NextResponse.json(await listProducts(siteId, page, 20, category));
}

export async function POST_products(req: NextRequest) {
  const data = await req.json();
  return NextResponse.json(await createProduct(data.siteId, data), {
    status: 201,
  });
}

export async function PATCH_products(req: NextRequest) {
  const { id, ...data } = await req.json();
  return NextResponse.json(await updateProduct(id, data));
}

export async function DELETE_products(req: NextRequest) {
  const { id } = await req.json();
  await deleteProduct(id);
  return NextResponse.json({ success: true });
}

export async function GET_cart(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') as string;
  const siteId = searchParams.get('siteId') as string;
  return NextResponse.json(await getCart(userId, siteId));
}

export async function POST_cart(req: NextRequest) {
  const data = await req.json();
  return NextResponse.json(
    await addToCart(
      data.userId,
      data.siteId,
      data.productId,
      data.quantity,
      data.variantId
    ),
    { status: 201 }
  );
}

export async function POST_checkout(req: NextRequest) {
  const data = await req.json();
  const order = await checkout(
    data.userId,
    data.siteId,
    data.paymentMethodId,
    data.shippingAddress
  );
  return NextResponse.json(order, { status: 201 });
}

export async function GET_orders(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId') as string;
  if (searchParams.get('id'))
    return NextResponse.json(await getOrder(searchParams.get('id')!));
  return NextResponse.json(await listOrders(siteId));
}
