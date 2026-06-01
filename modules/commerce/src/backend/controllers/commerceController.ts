import { prisma } from './db';

export async function listProducts(
  siteId: string,
  page = 1,
  limit = 20,
  category?: string
) {
  const where: any = { siteId };
  if (category) where.category = category;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { variants: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
}

export async function createProduct(siteId: string, data: any) {
  return prisma.product.create({ data: { siteId, ...data } });
}

export async function updateProduct(id: string, data: any) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}

export async function getCart(userId: string, siteId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId_siteId: { userId, siteId } },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, siteId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}

export async function addToCart(
  userId: string,
  siteId: string,
  productId: string,
  quantity = 1,
  variantId?: string
) {
  const cart = await getCart(userId, siteId);

  const existing = cart.items.find(
    (i) => i.productId === productId && i.variantId === (variantId || null)
  );

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity, variantId },
  });
}

export async function removeFromCart(cartItemId: string) {
  await prisma.cartItem.delete({ where: { id: cartItemId } });
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
}

export async function checkout(
  userId: string,
  siteId: string,
  paymentMethodId: string,
  shippingAddress: any
) {
  const cart = await getCart(userId, siteId);
  if (cart.items.length === 0) throw new Error('Cart is empty');

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId,
      siteId,
      total,
      status: 'pending',
      paymentMethodId,
      shippingAddress,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return order;
}

export async function listOrders(siteId: string, page = 1, limit = 20) {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { siteId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.order.count({ where: { siteId } }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({ where: { id }, data: { status } });
}

export async function processPayment(orderId: string, paymentIntentId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'paid', paymentIntentId },
  });
}
