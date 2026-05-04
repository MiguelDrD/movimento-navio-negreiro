const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'instructors.json');
const eventsFile = path.join(dataDir, 'events.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

async function ensureDataFile() {
  try {
    await fs.access(dataFile);
  } catch {
    const defaultInstructors = [
      {
        id: 'instr-1',
        name: 'Mestre Fumaça',
        title: 'Mestre',
        role: 'Mestre do Movimento Navio Negreiro',
        cordStyle: '#FF0000',
        cordName: 'Corda Vermelha',
        image: '../img/fumaca feliz.jpg',
        instagram: '#',
        facebook: '#',
        description: 'Mestre Fumaça é o iniciador do Projeto Social Navio Negreiro e dedica sua vida à preservação e difusão da cultura da capoeira. Com mais de 32 anos de experiência, ele começou sua jornada ainda criança e se tornou uma referência na área.',
        specialties: ['Cultura', 'Liderança', 'Tradição'],
        isMainInstructor: true
      },
      {
        id: 'instr-2',
        name: 'Mestre Paçoca',
        title: 'Mestre',
        role: 'Instrutor - Escola Municipal',
        cordStyle: '#FF0000',
        cordName: 'Corda Vermelha',
        image: '../img/mestre pacoca3.jpg.jpeg',
        instagram: '#',
        facebook: '#',
        description: 'Une educação e capoeira de forma única, desenvolvendo projetos educacionais inovadores.',
        specialties: ['Educação', 'Cultura'],
        isMainInstructor: false
      },
      {
        id: 'instr-3',
        name: 'Professor Bola 7',
        title: 'Professor',
        role: 'Instrutor - Centro Comunitário',
        cordStyle: '#800080',
        cordName: 'Corda Roxa',
        image: '../img/Professor bola 7 2.jpg',
        instagram: '#',
        facebook: '#',
        description: 'Especialista em técnicas avançadas de capoeira.',
        specialties: ['Técnica', 'Liderança'],
        isMainInstructor: false
      }
    ];
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(defaultInstructors, null, 2), 'utf8');
  }
}

async function readInstructors() {
  await ensureDataFile();
  const data = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(data);
}

async function writeInstructors(instructors) {
  await fs.writeFile(dataFile, JSON.stringify(instructors, null, 2), 'utf8');
}

async function ensureEventsFile() {
  try {
    await fs.access(eventsFile);
  } catch {
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
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(eventsFile, JSON.stringify(defaultEvents, null, 2), 'utf8');
  }
}

async function readEvents() {
  await ensureEventsFile();
  const data = await fs.readFile(eventsFile, 'utf8');
  return JSON.parse(data);
}

async function writeEvents(events) {
  await fs.writeFile(eventsFile, JSON.stringify(events, null, 2), 'utf8');
}

app.get('/api/instructors', async (req, res) => {
  try {
    const instructors = await readInstructors();
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível ler os instrutores.' });
  }
});

app.post('/api/instructors', async (req, res) => {
  try {
    const instructors = await readInstructors();
    if (Array.isArray(req.body)) {
      const sanitized = req.body.map(instr => ({
        ...instr,
        id: instr.id || `instr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }));
      await writeInstructors(sanitized);
      return res.status(200).json(sanitized);
    }

    const newInstructor = { ...req.body, id: `instr-${Date.now()}` };
    instructors.push(newInstructor);
    await writeInstructors(instructors);
    res.status(201).json(newInstructor);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível salvar o instrutor.' });
  }
});

app.put('/api/instructors/:id', async (req, res) => {
  try {
    const instructors = await readInstructors();
    const index = instructors.findIndex(i => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Instrutor não encontrado.' });
    }
    instructors[index] = { ...instructors[index], ...req.body, id: instructors[index].id };
    await writeInstructors(instructors);
    res.json(instructors[index]);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível atualizar o instrutor.' });
  }
});

app.delete('/api/instructors/:id', async (req, res) => {
  try {
    const instructors = await readInstructors();
    const filtered = instructors.filter(i => i.id !== req.params.id);
    if (filtered.length === instructors.length) {
      return res.status(404).json({ error: 'Instrutor não encontrado.' });
    }
    await writeInstructors(filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível remover o instrutor.' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await readEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível ler os eventos.' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível salvar o evento.' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const events = await readEvents();
    const index = events.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    events[index] = { ...events[index], ...req.body, id: events[index].id };
    await writeEvents(events);
    res.json(events[index]);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível atualizar o evento.' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const events = await readEvents();
    const filtered = events.filter(e => e.id !== req.params.id);
    if (filtered.length === events.length) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    await writeEvents(filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível remover o evento.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
