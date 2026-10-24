// Shared env loader for standalone tsx scripts. Next.js loads .env automatically
// for the app, but tsx scripts run outside that pipeline, so load it explicitly.
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());
