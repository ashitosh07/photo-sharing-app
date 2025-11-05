export default async function handler(req, res) {
  try {
    const { createRequestHandler } = await import('@react-router/node');
    const build = await import('../build/server/index.js');
    
    const requestHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || 'production',
    });
    
    return requestHandler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}