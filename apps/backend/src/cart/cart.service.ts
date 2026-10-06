import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { CheckoutDto } from './dto/checkout.dto';

type CartIdentity = { userId?: string; guestToken?: string };

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
  ) {}

  private async getOrCreateCart(identity: CartIdentity) {
    if (identity.userId) {
      let cart = await this.prisma.cart.findUnique({
        where: { userId: identity.userId },
      });
      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId: identity.userId },
        });
      } else if (cart.status !== 'ACTIVE') {
        cart = await this.prisma.cart.update({
          where: { id: cart.id },
          data: { status: 'ACTIVE' },
        });
      }
      return cart;
    }

    let guestToken = identity.guestToken;
    let cart = guestToken
      ? await this.prisma.cart.findUnique({ where: { guestToken } })
      : null;

    if (!cart) {
      guestToken = randomUUID();
      cart = await this.prisma.cart.create({ data: { guestToken } });
    }
    return cart;
  }

  private touchCart(cartId: string) {
    return this.prisma.cart.update({
      where: { id: cartId },
      data: { lastActivityAt: new Date() },
    });
  }

  // ---------------- Response সাজানো (items + smart pricing + coupon) ----------------
  private async formatCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found.');

    let subtotal = 0;
    let originalTotal = 0;
    let hasPriceChange = false;
    let hasStockIssue = false;

    const items = cart.items.map((item) => {
      const currentUnitPrice = item.product.discountPrice ?? item.product.price;
      const priceChanged = item.priceAtAdd !== currentUnitPrice;
      if (priceChanged) hasPriceChange = true;

      const stockIssue = item.quantity > item.product.stock;
      if (stockIssue) hasStockIssue = true;

      subtotal += currentUnitPrice * item.quantity;
      originalTotal += item.product.price * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        image: item.product.images[0] ?? null,
        unitPrice: currentUnitPrice,
        priceAtAdd: item.priceAtAdd,
        priceChanged,
        quantity: item.quantity,
        lineTotal: currentUnitPrice * item.quantity,
        availableStock: item.product.stock,
        stockIssue,
      };
    });

    const productDiscount = Math.max(0, originalTotal - subtotal);

    let couponDiscount = 0;
    let freeShipping = false;
    let couponMessage: string | undefined;
    let appliedCouponCode: string | null = cart.couponCode;

    if (cart.couponCode) {
      try {
        const result = await this.couponsService.validateAndCompute(
          cart.couponCode,
          subtotal,
        );
        couponDiscount = result.discount;
        freeShipping = result.freeShipping;
      } catch (err) {
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: { couponCode: null },
        });
        appliedCouponCode = null;
        couponMessage =
          err instanceof BadRequestException
            ? err.message
            : 'Coupon is no longer valid and was removed.';
      }
    }

    const shippingFee = freeShipping ? 0 : 0;
    const tax = 0;
    const discount = productDiscount + couponDiscount;
    const total = Math.max(0, subtotal - couponDiscount + shippingFee + tax);

    return {
      cartId: cart.id,
      status: cart.status,
      guestToken: cart.guestToken ?? undefined,
      couponCode: appliedCouponCode,
      couponMessage,
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      pricing: {
        originalTotal,
        subtotal,
        productDiscount,
        couponDiscount,
        discount,
        shippingFee,
        tax,
        total,
        youSave: discount,
      },
      flags: {
        hasPriceChange,
        hasStockIssue,
        freeShipping,
      },
    };
  }

  // ---------------- GET cart ----------------
  async getCart(identity: CartIdentity) {
    const cart = await this.getOrCreateCart(identity);
    await this.touchCart(cart.id);
    return this.formatCart(cart.id);
  }

  // ---------------- ADD item ----------------
  async addItem(identity: CartIdentity, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found.');
    }

    const cart = await this.getOrCreateCart(identity);
    const currentUnitPrice = product.discountPrice ?? product.price;

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;
    if (desiredQuantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} unit(s) of "${product.name}" available.`,
      );
    }

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: desiredQuantity, priceAtAdd: currentUnitPrice },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAdd: currentUnitPrice,
        },
      });
    }

    await this.touchCart(cart.id);
    return this.formatCart(cart.id);
  }

  // ---------------- UPDATE quantity ----------------
  async updateItem(identity: CartIdentity, productId: string, quantity: number) {
    const cart = await this.getOrCreateCart(identity);

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      include: { product: true },
    });
    if (!item) {
      throw new NotFoundException('Item not found in cart.');
    }
    if (quantity > item.product.stock) {
      throw new BadRequestException(
        `Only ${item.product.stock} unit(s) of "${item.product.name}" available.`,
      );
    }

    await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    await this.touchCart(cart.id);
    return this.formatCart(cart.id);
  }

  // ---------------- REMOVE item ----------------
  async removeItem(identity: CartIdentity, productId: string) {
    const cart = await this.getOrCreateCart(identity);

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (!item) {
      throw new NotFoundException('Item not found in cart.');
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    await this.touchCart(cart.id);
    return this.formatCart(cart.id);
  }

  // ---------------- CLEAR cart ----------------
  async clearCart(identity: CartIdentity) {
    const cart = await this.getOrCreateCart(identity);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await this.touchCart(cart.id);
    return this.formatCart(cart.id);
  }

  // ---------------- APPLY coupon ----------------
  async applyCoupon(identity: CartIdentity, code: string) {
    const cart = await this.getOrCreateCart(identity);
    const subtotal = await this.calculateSubtotal(cart.id);

    const { coupon } = await this.couponsService.validateAndCompute(code, subtotal);

    if (identity.userId && coupon.perUserLimit) {
      const usedCount = await this.prisma.order.count({
        where: {
          userId: identity.userId,
          couponCode: coupon.code,
          status: { not: 'CANCELLED' },
        },
      });
      if (usedCount >= coupon.perUserLimit) {
        throw new BadRequestException(
          'You have already used this coupon the maximum number of times.',
        );
      }
    }

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: code.toUpperCase() },
    });

    await this.touchCart(cart.id);
    return this.formatCart(cart.id);
  }

  // ---------------- REMOVE coupon ----------------
  async removeCoupon(identity: CartIdentity) {
    const cart = await this.getOrCreateCart(identity);
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: null },
    });
    await this.touchCart(cart.id);
    return this.formatCart(cart.id);
  }

  private async calculateSubtotal(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });
    return items.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }

  // ---------------- MERGE guest cart → user cart ----------------
  async mergeGuestCart(userId: string, guestToken: string) {
    const guestCart = await this.prisma.cart.findUnique({
      where: { guestToken },
      include: { items: true },
    });
    if (!guestCart) {
      return this.getCart({ userId });
    }

    const userCart = await this.getOrCreateCart({ userId });

    for (const item of guestCart.items) {
      const existing = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: { cartId: userCart.id, productId: item.productId },
        },
      });
      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd,
          },
        });
      }
    }

    if (guestCart.couponCode && !userCart.couponCode) {
      await this.prisma.cart.update({
        where: { id: userCart.id },
        data: { couponCode: guestCart.couponCode },
      });
    }

    await this.prisma.cart.delete({ where: { id: guestCart.id } });
    await this.touchCart(userCart.id);
    return this.formatCart(userCart.id);
  }

  // ---------------- CHECKOUT (Cart → Order conversion) ----------------
  private generateOrderNumber() {
    const time = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${time}${rand}`;
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.getOrCreateCart({ userId });

    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.cart.updateMany({
        where: { id: cart.id, status: 'ACTIVE' },
        data: { status: 'CONVERTED' },
      });
      if (locked.count === 0) {
        throw new BadRequestException(
          'This cart is already being checked out or has no items.',
        );
      }

      const items = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
      });

      if (items.length === 0) {
        throw new BadRequestException('Your cart is empty.');
      }

      let subtotal = 0;
      const orderItems: { productId: string; quantity: number; price: number }[] = [];

      for (const item of items) {
        if (!item.product.isActive) {
          throw new BadRequestException(`"${item.product.name}" is no longer available.`);
        }
        const unitPrice = item.product.discountPrice ?? item.product.price;
        subtotal += unitPrice * item.quantity;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: unitPrice,
        });

        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new BadRequestException(
            `Not enough stock for "${item.product.name}".`,
          );
        }
      }

      let couponDiscount = 0;
      let appliedCoupon: { id: string } | null = null;
      let usedCouponCode: string | undefined;

      if (cart.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: cart.couponCode },
        });
        const now = new Date();

        let perUserOk = true;
        if (coupon?.perUserLimit) {
          const usedCount = await tx.order.count({
            where: {
              userId,
              couponCode: coupon.code,
              status: { not: 'CANCELLED' },
            },
          });
          perUserOk = usedCount < coupon.perUserLimit;
        }

        const valid =
          coupon &&
          coupon.isActive &&
          perUserOk &&
          (!coupon.startsAt || coupon.startsAt <= now) &&
          (!coupon.expiresAt || coupon.expiresAt >= now) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount);

        if (valid && coupon) {
          if (coupon.type === 'PERCENTAGE') {
            couponDiscount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount) {
              couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
            }
          } else if (coupon.type === 'FIXED') {
            couponDiscount = Math.min(coupon.value, subtotal);
          }
          appliedCoupon = { id: coupon.id };
          usedCouponCode = coupon.code;
        }
      }

      let shippingFee = 0;
      let shippingMethodName: string | undefined;

      if (dto.shippingMethodId) {
        const method = await tx.shippingMethod.findUnique({
          where: { id: dto.shippingMethodId },
        });
        if (method && method.isActive) {
          shippingFee = method.rate;
          shippingMethodName = method.name;
        }
      }

      const totalAmount = Math.max(0, subtotal - couponDiscount) + shippingFee;

      const order = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          totalAmount,
          shippingFee,
          shippingMethodName,
          couponCode: usedCouponCode,
          shippingAddress: dto.shippingAddress,
          shippingPhone: dto.shippingPhone,
          paymentMethod: dto.paymentMethod,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { couponCode: null },
      });

      return order;
    });
  }

  // ---------------- CANCEL (customer, own order only) ----------------
  async cancelMyOrder(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found.');
      }

      if (order.userId !== userId) {
        throw new ForbiddenException('You cannot cancel this order.');
      }

      if (!['PENDING', 'PROCESSING'].includes(order.status)) {
        throw new BadRequestException(
          `Order cannot be cancelled once it is ${order.status.toLowerCase()}.`,
        );
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });
    });
  }
}