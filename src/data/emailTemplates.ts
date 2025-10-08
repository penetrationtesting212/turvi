export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  subject: string;
  content: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome-series",
    name: "Welcome Series",
    description: "Onboard new subscribers with a warm welcome",
    category: "Onboarding",
    thumbnail: "📧",
    subject: "Welcome to {{company_name}}!",
    content: `
      <h1>Welcome aboard!</h1>
      <p>Hi {{first_name}},</p>
      <p>We're thrilled to have you join our community. Here's what you can expect:</p>
      <ul>
        <li>Weekly tips and insights</li>
        <li>Exclusive offers and updates</li>
        <li>Access to our resource library</li>
      </ul>
      <a href="{{cta_link}}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Get Started</a>
    `
  },
  {
    id: "newsletter",
    name: "Monthly Newsletter",
    description: "Keep subscribers informed with regular updates",
    category: "Engagement",
    thumbnail: "📰",
    subject: "Your Monthly Update from {{company_name}}",
    content: `
      <h1>This Month's Highlights</h1>
      <p>Hi {{first_name}},</p>
      <h2>What's New</h2>
      <p>{{content_section_1}}</p>
      <h2>Featured Content</h2>
      <p>{{content_section_2}}</p>
      <h2>Upcoming Events</h2>
      <p>{{content_section_3}}</p>
      <a href="{{cta_link}}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Read More</a>
    `
  },
  {
    id: "promotional",
    name: "Promotional Offer",
    description: "Drive sales with compelling offers",
    category: "Sales",
    thumbnail: "🎁",
    subject: "Exclusive Offer: {{discount}}% OFF",
    content: `
      <h1>Special Offer Just for You!</h1>
      <p>Hi {{first_name}},</p>
      <p>We're excited to offer you an exclusive {{discount}}% discount on {{product_name}}.</p>
      <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0; color: #0066cc;">{{discount}}% OFF</h2>
        <p style="margin: 10px 0 0 0;">Use code: <strong>{{promo_code}}</strong></p>
      </div>
      <p>This offer expires on {{expiry_date}}. Don't miss out!</p>
      <a href="{{cta_link}}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Shop Now</a>
    `
  },
  {
    id: "abandoned-cart",
    name: "Abandoned Cart",
    description: "Recover lost sales with gentle reminders",
    category: "Sales",
    thumbnail: "🛒",
    subject: "You left something behind...",
    content: `
      <h1>Don't forget your items!</h1>
      <p>Hi {{first_name}},</p>
      <p>We noticed you left some items in your cart. They're still waiting for you!</p>
      <div style="border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Your Cart:</strong></p>
        <p>{{cart_items}}</p>
        <p><strong>Total:</strong> {{cart_total}}</p>
      </div>
      <p>Complete your purchase now and get <strong>free shipping</strong> on this order!</p>
      <a href="{{cart_link}}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Complete Purchase</a>
    `
  },
  {
    id: "re-engagement",
    name: "Win-Back Campaign",
    description: "Re-engage inactive subscribers",
    category: "Retention",
    thumbnail: "💌",
    subject: "We miss you, {{first_name}}!",
    content: `
      <h1>Come back to us!</h1>
      <p>Hi {{first_name}},</p>
      <p>It's been a while since we last heard from you. We wanted to check in and see if there's anything we can do to improve your experience.</p>
      <p>Here's what you've missed:</p>
      <ul>
        <li>{{update_1}}</li>
        <li>{{update_2}}</li>
        <li>{{update_3}}</li>
      </ul>
      <p>As a welcome back gift, enjoy <strong>20% OFF</strong> your next purchase!</p>
      <a href="{{cta_link}}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Claim Your Offer</a>
    `
  },
  {
    id: "event-invitation",
    name: "Event Invitation",
    description: "Invite subscribers to webinars and events",
    category: "Engagement",
    thumbnail: "🎤",
    subject: "You're Invited: {{event_name}}",
    content: `
      <h1>Join Us for {{event_name}}</h1>
      <p>Hi {{first_name}},</p>
      <p>We're excited to invite you to our upcoming event!</p>
      <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0;">{{event_name}}</h2>
        <p><strong>Date:</strong> {{event_date}}</p>
        <p><strong>Time:</strong> {{event_time}}</p>
        <p><strong>Location:</strong> {{event_location}}</p>
      </div>
      <p>{{event_description}}</p>
      <a href="{{registration_link}}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Register Now</a>
    `
  }
];

export const getTemplatesByCategory = (category: string) => {
  return emailTemplates.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
  return emailTemplates.find(t => t.id === id);
};
