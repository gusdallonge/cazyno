import { authenticate, requireAdmin } from '../auth.js';

export default async function integrationRoutes(fastify) {
  // Send email (admin only)
  fastify.post('/integrations/send-email', { preHandler: [authenticate, requireAdmin] }, async (request, reply) => {
    const { to, subject, body } = request.body;

    // TODO: Replace with your email provider (Resend, SendGrid, etc.)
    // Example with Resend:
    // const res = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ from: 'Cazyno <noreply@yourdomain.com>', to: [to], subject, html: body }),
    // });

    return { success: true };
  });

  // LLM chat (authenticated)
  fastify.post('/integrations/llm', { preHandler: [authenticate] }, async (request, reply) => {
    const { prompt } = request.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return { text: "Le chatbot est temporairement indisponible." };
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "Désolé, je n'ai pas pu répondre.";
      return { text };
    } catch {
      return { text: "Erreur lors de la connexion au chatbot." };
    }
  });

  // Total wagered (public)
  fastify.get('/rpc/total-wagered', async () => {
    const db = (await import('../db.js')).default;
    const { rows } = await db.query('SELECT COALESCE(SUM(total_wagered), 0) as total FROM user_profiles');
    return rows[0].total;
  });
}
