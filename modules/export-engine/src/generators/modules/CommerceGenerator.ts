import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator.js';

export class CommerceGenerator implements ModuleGenerator {
  readonly moduleId = 'commerce';
  readonly moduleName = 'Commerce';

  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const commerceRouter = Router();

commerceRouter.get('/products', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({ where: { published: true } });
    res.json(products);
  } catch (err) { next(err); }
});

commerceRouter.get('/products/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) { next(err); }
});

commerceRouter.post('/cart', async (req, res, next) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    const item = await prisma.cartItem.upsert({
      where: { sessionId_productId: { sessionId, productId } },
      update: { quantity: { increment: quantity || 1 } },
      create: { sessionId, productId, quantity: quantity || 1 },
    });
    res.json(item);
  } catch (err) { next(err); }
});

commerceRouter.post('/checkout', async (req, res, next) => {
  try {
    const { sessionId, email, items } = req.body;
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const order = await prisma.order.create({
      data: { email, items, total, status: 'pending' },
    });
    res.status(201).json(order);
  } catch (err) { next(err); }
});

commerceRouter.get('/orders', authenticate, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch (err) { next(err); }
});
`;
  }

  generatePrismaModels(): string {
    return `model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  compareAt   Float?
  image       String?
  images      Json     @default("[]")
  inventory   Int      @default(0)
  sku         String?
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  email      String?
  items      Json
  total      Float
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}

model CartItem {
  id        String   @id @default(cuid())
  sessionId String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())

  @@unique([sessionId, productId])
}
`;
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'ProductCard.tsx',
        content: `import React from 'react';
import api from '../../lib/api';

interface Product { id: string; name: string; price: number; image?: string; description?: string; }

export const ProductCard: React.FC<{ product: Product; onAddToCart: (id: string) => void }> = ({ product, onAddToCart }) => (
  <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
    {product.image && <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />}
    <div className="p-4">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-lg font-bold">\${product.price.toFixed(2)}</span>
        <button onClick={() => onAddToCart(product.id)} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);
`,
      },
    ];
  }
}
