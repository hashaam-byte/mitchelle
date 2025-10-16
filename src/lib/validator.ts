// lib/validations.ts - Input Validation Schemas
import { z } from 'zod';

// User Registration
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  role: z.enum(['CLIENT', 'ADMIN']).default('CLIENT'),
});

// User Login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  isSuperAdmin: z.string().optional(),
  superAdminKey: z.string().optional(),
});

// Product Creation
export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url('Invalid image URL'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isFeatured: z.boolean().default(false),
});

// Order Creation
export const orderSchema = z.object({
  deliveryAddress: z.string().min(10, 'Please provide a complete address'),
  discountCode: z.string().optional(),
});

// Discount Creation
export const discountSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minPurchase: z.number().min(0),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
});

// Cart Item
export const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

// Profile Update
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
});

// Helper function to validate and sanitize input
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}