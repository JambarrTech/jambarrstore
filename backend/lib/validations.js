const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().min(9, 'Numéro de téléphone invalide').max(20),
  password: z.string().min(6, 'Mot de passe doit contenir au moins 6 caractères').max(100),
  role: z.enum(['CLIENT', 'ADMIN', 'MANAGER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const productSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  reference: z.string().min(1, 'Référence requise').max(50),
  price: z.number().positive('Le prix doit être positif'),
  oldPrice: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif').optional(),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  categoryId: z.string().uuid('ID catégorie invalide'),
  isFeatured: z.boolean().optional(),
  isFlash: z.boolean().optional(),
  description: z.string().max(2000).optional(),
});

const orderSchema = z.object({
  clientName: z.string().min(2, 'Nom requis').max(100),
  clientPhone: z.string().min(9, 'Téléphone invalide').max(20),
  clientAddress: z.string().max(500).optional(),
  items: z.array(z.object({
    productId: z.string().uuid('ID produit invalide'),
    quantity: z.number().int().positive('Quantité invalide'),
  })).min(1, 'Au moins un produit requis'),
  paymentMethod: z.enum(['Wave', 'Orange Money']),
});

const reviewSchema = z.object({
  productId: z.string().uuid('ID produit invalide').optional().nullable(),
  clientName: z.string().min(1, 'Nom requis').max(100),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1, 'Commentaire requis').max(1000),
});

const promotionSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  discountPercent: z.number().int().min(1, 'Pourcentage invalide').max(100),
  targetCategory: z.string().min(1, 'Catégorie requise'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const settingsSchema = z.object({
  storeName: z.string().max(200).optional(),
  storeEmail: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().nullable(),
  commissionRate: z.number().min(0).max(100).optional(),
  minCommission: z.number().min(0).optional(),
});

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error;
    const issues = error.issues || error.errors || [];
    const errors = issues.map(e => `${e.path.join('.')}: ${e.message}`);
    return { valid: false, errors };
  }
  return { valid: true, data: result.data };
}

module.exports = {
  registerSchema,
  loginSchema,
  productSchema,
  orderSchema,
  reviewSchema,
  promotionSchema,
  settingsSchema,
  validate,
};
