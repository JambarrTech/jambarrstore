const { validate, registerSchema, loginSchema, productSchema, orderSchema, reviewSchema, promotionSchema, settingsSchema } = require('../api/lib/validations');

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+221771234567',
        password: 'password123',
      };
      const result = validate(registerSchema, data);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        name: 'Test User',
        email: 'invalid-email',
        phone: '+221771234567',
        password: 'password123',
      };
      const result = validate(registerSchema, data);
      expect(result.valid).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+221771234567',
        password: '12345',
      };
      const result = validate(registerSchema, data);
      expect(result.valid).toBe(false);
    });

    it('should reject missing required fields', () => {
      const data = { name: 'Test User' };
      const result = validate(registerSchema, data);
      expect(result.valid).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = validate(loginSchema, data);
      expect(result.valid).toBe(true);
    });

    it('should reject missing password', () => {
      const data = { email: 'test@example.com' };
      const result = validate(loginSchema, data);
      expect(result.valid).toBe(false);
    });
  });

  describe('productSchema', () => {
    it('should validate correct product data', () => {
      const data = {
        name: 'Test Product',
        reference: 'REF-001',
        price: 25000,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = validate(productSchema, data);
      expect(result.valid).toBe(true);
    });

    it('should reject negative price', () => {
      const data = {
        name: 'Test Product',
        reference: 'REF-001',
        price: -100,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = validate(productSchema, data);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid UUID for categoryId', () => {
      const data = {
        name: 'Test Product',
        reference: 'REF-001',
        price: 25000,
        categoryId: 'invalid-uuid',
      };
      const result = validate(productSchema, data);
      expect(result.valid).toBe(false);
    });
  });

  describe('orderSchema', () => {
    it('should validate correct order data', () => {
      const data = {
        clientName: 'John Doe',
        clientPhone: '+221771234567',
        items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 }],
        paymentMethod: 'Wave',
      };
      const result = validate(orderSchema, data);
      expect(result.valid).toBe(true);
    });

    it('should reject empty items array', () => {
      const data = {
        clientName: 'John Doe',
        clientPhone: '+221771234567',
        items: [],
        paymentMethod: 'Wave',
      };
      const result = validate(orderSchema, data);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid payment method', () => {
      const data = {
        clientName: 'John Doe',
        clientPhone: '+221771234567',
        items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 }],
        paymentMethod: 'InvalidMethod',
      };
      const result = validate(orderSchema, data);
      expect(result.valid).toBe(false);
    });
  });

  describe('reviewSchema', () => {
    it('should validate correct review data', () => {
      const data = {
        clientName: 'John Doe',
        rating: 5,
        comment: 'Great product!',
      };
      const result = validate(reviewSchema, data);
      expect(result.valid).toBe(true);
    });

    it('should reject rating outside 1-5 range', () => {
      const data = {
        clientName: 'John Doe',
        rating: 6,
        comment: 'Great product!',
      };
      const result = validate(reviewSchema, data);
      expect(result.valid).toBe(false);
    });
  });

  describe('promotionSchema', () => {
    it('should validate correct promotion data', () => {
      const data = {
        title: 'Summer Sale',
        discountPercent: 20,
        targetCategory: 'Electronics',
      };
      const result = validate(promotionSchema, data);
      expect(result.valid).toBe(true);
    });

    it('should reject discount over 100%', () => {
      const data = {
        title: 'Summer Sale',
        discountPercent: 150,
        targetCategory: 'Electronics',
      };
      const result = validate(promotionSchema, data);
      expect(result.valid).toBe(false);
    });
  });

  describe('settingsSchema', () => {
    it('should validate correct settings data', () => {
      const data = {
        storeName: 'My Store',
        storeEmail: 'store@example.com',
      };
      const result = validate(settingsSchema, data);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid email format', () => {
      const data = { storeEmail: 'not-an-email' };
      const result = validate(settingsSchema, data);
      expect(result.valid).toBe(false);
    });
  });
});
