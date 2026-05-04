const { kv } = require('@vercel/kv');

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

async function readInstructors() {
  let instructors = await kv.get('instructors');
  if (!instructors) {
    instructors = defaultInstructors;
    await kv.set('instructors', instructors);
  }
  return instructors;
}

async function writeInstructors(instructors) {
  await kv.set('instructors', instructors);
}

export default async function handler(req, res) {
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
      const instructors = await readInstructors();
      res.status(200).json(instructors);
    } else if (req.method === 'POST') {
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
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const instructors = await readInstructors();
      const index = instructors.findIndex(i => i.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Instrutor não encontrado.' });
      }
      instructors[index] = { ...instructors[index], ...req.body, id: instructors[index].id };
      await writeInstructors(instructors);
      res.status(200).json(instructors[index]);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const instructors = await readInstructors();
      const filtered = instructors.filter(i => i.id !== id);
      if (filtered.length === instructors.length) {
        return res.status(404).json({ error: 'Instrutor não encontrado.' });
      }
      await writeInstructors(filtered);
      res.status(204).end();
    } else {
      res.status(405).json({ error: 'Método não permitido.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}