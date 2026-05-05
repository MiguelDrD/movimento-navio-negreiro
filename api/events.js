const { kv } = require('@vercel/kv');

const defaultEvents = [
  {
    id: 'evt-1',
    title: 'Roda de Capoeira Mensal',
    day: 'Último <br>domingo<br> do mês',
    month: '',
    desc: 'Nossa tradicional roda mensal realizada todo último domingo do mês. Venha celebrar a capoeira conosco!',
    time: '9:00',
    location: 'Feira permanente do Riacho Fundo II',
    tags: ['Roda', 'Gratuito', 'Todas as idades'],
    featured: true
  },
  {
    id: 'evt-2',
    title: 'Roda de Capoeira Mensal',
    day: '',
    month: '',
    desc: 'Nossa tradicional roda mensal realizada todo último domingo do mês. Venha celebrar a capoeira conosco!',
    time: '9:00',
    location: 'Salão comunitário da Divinéia',
    tags: ['Roda', 'Gratuito', 'Todas as idades'],
    featured: true
  },
  {
    id: 'evt-3',
    title: 'Batizado',
    day: '23',
    month: 'AGO',
    desc: '',
    time: '7:00 - 18:00',
    location: 'Canto do Buriti - PI',
    tags: ['Batizado', 'Roda', 'Almoço'],
    featured: false
  },
  {
    id: 'evt-4',
    title: 'Batizado',
    day: '19',
    month: 'OUT',
    desc: '',
    time: '9:00',
    location: 'Riacho Fundo II - DF',
    tags: ['Batizado', 'Roda', 'Almoço'],
    featured: false
  }
];

async function readEvents() {
  let events = await kv.get('events');
  if (!events) {
    events = defaultEvents;
    await kv.set('events', events);
  }
  return events;
}

async function writeEvents(events) {
  await kv.set('events', events);
}

async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const events = await readEvents();
      res.status(200).json(events);
    } else if (req.method === 'POST') {
      const events = await readEvents();
      if (Array.isArray(req.body)) {
        const sanitized = req.body.map(evt => ({
          ...evt,
          id: evt.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }));
        await writeEvents(sanitized);
        return res.status(200).json(sanitized);
      }

      const newEvent = { ...req.body, id: `evt-${Date.now()}` };
      events.push(newEvent);
      await writeEvents(events);
      res.status(201).json(newEvent);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const events = await readEvents();
      const index = events.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }
      events[index] = { ...events[index], ...req.body, id: events[index].id };
      await writeEvents(events);
      res.status(200).json(events[index]);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const events = await readEvents();
      const filtered = events.filter(e => e.id !== id);
      if (filtered.length === events.length) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }
      await writeEvents(filtered);
      res.status(204).end();
    } else {
      res.status(405).json({ error: 'Método não permitido.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor.', details: error.message, stack: error.stack });
  }
}

module.exports = handler;