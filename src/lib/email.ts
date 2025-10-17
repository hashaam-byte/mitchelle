// lib/email.ts - Email Notification System using Resend
import { Resend } from 'resend';

// Only initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM || 'MsCakeHub <noreply@mscakehub.com>';

// Email Templates
const emailTemplates = {
  orderConfirmation: (data: {
    customerName: string;
    orderId: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }) => ({
    subject: `Order Confirmation - ${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #fdf2f8; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ec4899, #be185d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .order-id { background: #fce7f3; padding: 12px; border-radius: 8px; margin: 16px 0; }
            .items { margin: 24px 0; }
            .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #fce7f3; }
            .total { font-size: 24px; font-weight: bold; color: #ec4899; text-align: right; margin-top: 24px; }
            .footer { text-align: center; margin-top: 32px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍰 MsCakeHub</div>
              <h1>Thank You for Your Order!</h1>
            </div>
            
            <p>Hi ${data.customerName},</p>
            <p>Your order has been confirmed and will be prepared shortly.</p>
            
            <div class="order-id">
              <strong>Order ID:</strong> ${data.orderId}
            </div>
            
            <div class="items">
              <h3>Order Items:</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} x${item.quantity}</span>
                  <span>₦${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              Total: ₦${data.total.toLocaleString()}
            </div>
            
            <p style="margin-top: 32px;">We'll notify you once your order is ready for delivery.</p>
            
            <div class="footer">
              <p>Questions? Contact us at support@mscakehub.com</p>
              <p>&copy; 2025 MsCakeHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  orderStatusUpdate: (data: {
    customerName: string;
    orderId: string;
    status: string;
  }) => ({
    subject: `Order ${data.status} - ${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #fdf2f8; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ec4899, #be185d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .status { background: #dcfce7; color: #166534; padding: 16px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: bold; margin: 24px 0; }
            .footer { text-align: center; margin-top: 32px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍰 MsCakeHub</div>
              <h1>Order Status Update</h1>
            </div>
            
            <p>Hi ${data.customerName},</p>
            <p>Your order <strong>${data.orderId}</strong> status has been updated:</p>
            
            <div class="status">
              ${data.status}
            </div>
            
            ${data.status === 'DELIVERED' ? 
              '<p>Your order has been delivered! We hope you enjoy every bite. 😊</p>' :
              '<p>We\'ll keep you updated as your order progresses.</p>'
            }
            
            <div class="footer">
              <p>Track your order at mscakehub.com/orders</p>
              <p>&copy; 2025 MsCakeHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  welcomeEmail: (data: { name: string; email: string }) => ({
    subject: 'Welcome to MsCakeHub! 🍰',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #fdf2f8; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ec4899, #be185d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .discount { background: linear-gradient(to right, #ec4899, #be185d); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; }
            .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 16px 0; }
            .footer { text-align: center; margin-top: 32px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍰 MsCakeHub</div>
              <h1>Welcome to the Sweetest Community!</h1>
            </div>
            
            <p>Hi ${data.name},</p>
            <p>We're thrilled to have you join MsCakeHub! Get ready to indulge in handcrafted cakes, cookies, and pastries made with love.</p>
            
            <div class="discount">
              <h2 style="margin: 0 0 16px 0;">Here's a special welcome gift! 🎁</h2>
              <p style="margin: 0;">Use code</p>
              <div class="code">WELCOME10</div>
              <p style="margin: 0;">for 10% off your first order</p>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Browse our delicious products</li>
              <li>Add favorites to your cart</li>
              <li>Apply your discount code at checkout</li>
              <li>Enjoy fresh, quality treats delivered to you</li>
            </ul>
            
            <p style="text-align: center; margin-top: 32px;">
              <a href="https://mscakehub.com/client/products" style="background: linear-gradient(to right, #ec4899, #be185d); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
                Start Shopping
              </a>
            </p>
            
            <div class="footer">
              <p>Need help? Contact us at support@mscakehub.com</p>
              <p>&copy; 2025 MsCakeHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Send Email Functions
export async function sendOrderConfirmationEmail(data: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  if (!resend) {
    console.log('⚠️ Email not configured - skipping order confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const template = emailTemplates.orderConfirmation({
      customerName: data.customerName,
      orderId: data.orderId,
      total: data.total,
      items: data.items,
    });

    await resend.emails.send({
      from: fromEmail,
      to: data.to,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Order confirmation email sent to:', data.to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendOrderStatusEmail(data: {
  to: string;
  customerName: string;
  orderId: string;
  status: string;
}) {
  if (!resend) {
    console.log('⚠️ Email not configured - skipping order status email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const template = emailTemplates.orderStatusUpdate(data);

    await resend.emails.send({
      from: fromEmail,
      to: data.to,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Order status email sent to:', data.to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send order status email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(data: {
  to: string;
  name: string;
}) {
  if (!resend) {
    console.log('⚠️ Email not configured - skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const template = emailTemplates.welcomeEmail({
      name: data.name,
      email: data.to,
    });

    await resend.emails.send({
      from: fromEmail,
      to: data.to,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Welcome email sent to:', data.to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error };
  }
}

// Helper to check if email is configured
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && resend !== null;
}