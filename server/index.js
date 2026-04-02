import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import authRoutes from './routes/auth.js';
import userProfileRoutes from './routes/userProfiles.js';
import gameRoundRoutes from './routes/gameRounds.js';
import supportTicketRoutes from './routes/supportTickets.js';
import userRoutes from './routes/users.js';
import integrationRoutes from './routes/integrations.js';
import auditRoutes from './routes/audit.js';
import leaderboardRoutes from './routes/leaderboard.js';
import rewardsRoutes from './routes/rewards.js';
import affiliateRoutes from './routes/affiliates.js';
import { runDailyRewards } from './jobs/dailyRewards.js';
import { runInactivityCheck } from './jobs/inactivityCheck.js';
import { runLeaderboardReset } from './jobs/leaderboardReset.js';

const fastify = Fastify({ logger: true });

// Security: HTTP headers
await fastify.register(helmet, {
  contentSecurityPolicy: false, // Disable CSP to avoid breaking frontend proxied requests
});

// Security: Rate limiting (global 100 req/min)
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// CORS: restrict origins
await fastify.register(cors, {
  origin: ['http://localhost:5173', 'https://cazyno.net'],
  credentials: true,
});

// Tighter rate limit for auth routes (5 req/min)
fastify.addHook('onRoute', (routeOptions) => {
  if (routeOptions.url && routeOptions.url.startsWith('/auth')) {
    const existingPreHandler = routeOptions.preHandler || [];
    const handlers = Array.isArray(existingPreHandler) ? existingPreHandler : [existingPreHandler];
    routeOptions.config = {
      ...routeOptions.config,
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    };
  }
});

// Register routes
await fastify.register(authRoutes);
await fastify.register(userProfileRoutes);
await fastify.register(gameRoundRoutes);
await fastify.register(supportTicketRoutes);
await fastify.register(userRoutes);
await fastify.register(integrationRoutes);
await fastify.register(leaderboardRoutes);
await fastify.register(rewardsRoutes);
await fastify.register(auditRoutes);
await fastify.register(affiliateRoutes);

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

// ─── Cron jobs (simple setInterval) ───
const ONE_DAY = 24 * 60 * 60 * 1000;
setInterval(runDailyRewards, ONE_DAY);
setInterval(runInactivityCheck, ONE_DAY);
setInterval(runLeaderboardReset, ONE_DAY);

try {
  await fastify.listen({ port, host });
  console.log(`Server running on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
