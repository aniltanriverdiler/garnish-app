/**
 * Uygulamanın giriş noktası (entry point).
 * dotenv ile .env dosyasını yükler, Express uygulamasını belirtilen port üzerinde başlatır.
 * Tüm konfigürasyon, middleware ve route tanımları app.ts içinde yapılır;
 * bu dosya yalnızca sunucuyu ayağa kaldırır.
 */

import "dotenv/config";
import app from "./app";
import { env } from "./config/env";

// Start the HTTP server
app.listen(env.PORT, () => {
  console.log(`[server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`[server] Health check: http://localhost:${env.PORT}/api/health`);
});
