document.addEventListener('DOMContentLoaded', () => {
    // Eventos padrão iniciais
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

    const API_BASE = window.location.protocol === 'http:' || window.location.protocol === 'https:'
        ? window.location.origin
        : 'http://localhost:3000';
    const API_URL = `${API_BASE}/api/events`;

    // Carregar eventos do servidor ou usar os locais como fallback
    async function getEvents() {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            return await fetchEventsFromApi();
        }
        return getLocalEvents();
    }

    async function fetchEventsFromApi() {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Falha ao carregar de API');
        }
        return await response.json();
    }

    function getLocalEvents() {
        const stored = localStorage.getItem('navio_negreiro_events');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    const cleaned = cleanStoredEvents(parsed);
                    if (cleaned.length !== parsed.length) {
                        saveLocalEvents(cleaned);
                    }
                    return cleaned;
                }
            } catch (error) {
                console.warn('Erro ao ler eventos do localStorage:', error);
            }
        }

        saveLocalEvents(defaultEvents);
        return defaultEvents;
    }

    function cleanStoredEvents(events) {
        return events.filter(evt => evt && typeof evt === 'object' && evt.id);
    }

    function saveLocalEvents(events) {
        localStorage.setItem('navio_negreiro_events', JSON.stringify(events));
    }

    async function saveEvents(events) {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(events)
            });
            if (!response.ok) {
                throw new Error('Falha ao salvar na API');
            }
            return await response.json();
        }
        saveLocalEvents(events);
        return events;
    }

    async function createEvent(eventData) {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            if (!response.ok) {
                throw new Error('Falha ao criar evento');
            }
            return await response.json();
        }

        const events = getLocalEvents();
        const newEvent = { ...eventData, id: `evt-${Date.now()}` };
        events.push(newEvent);
        saveLocalEvents(events);
        return newEvent;
    }

    async function updateEvent(id, eventData) {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            const response = await fetch(`${API_URL}?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            if (!response.ok) {
                throw new Error('Falha ao atualizar evento');
            }
            return await response.json();
        }

        const events = getLocalEvents();
        const index = events.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error('Evento não encontrado');
        }
        events[index] = { ...events[index], ...eventData, id };
        saveLocalEvents(events);
        return events[index];
    }

    async function deleteEvent(id) {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            const response = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Falha ao remover evento');
            }
            return true;
        }

        const events = getLocalEvents();
        const filtered = events.filter(e => e.id !== id);
        if (filtered.length === events.length) {
            throw new Error('Evento não encontrado');
        }
        saveLocalEvents(filtered);
        return true;
    }

    const currentPage = window.location.pathname;
    const isAdminPage = currentPage.includes('admin-eventos.html');

    // === LÓGICA PARA eventos.html ===
    if (!isAdminPage) {
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            renderPublicEvents();
        }

        function renderPublicEvents() {
            getEvents()
                .then(events => {
                    eventsGrid.innerHTML = '';

                    if (events.length === 0) {
                        eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Nenhum evento programado no momento.</p>';
                        return;
                    }

                    events.forEach(evt => {
                        const card = document.createElement('div');
                        card.className = `event-card ${evt.featured ? 'featured' : ''}`;

                        const tagsHtml = evt.tags.filter(t => t.trim() !== '').map(tag => `<span class="tag">${tag.trim()}</span>`).join('');

                        card.innerHTML = `
                            <div class="event-date">
                                <span class="day">${evt.day}</span>
                                <span class="month">${evt.month}</span>
                            </div>
                            <div class="event-content">
                                <h3>${evt.title}</h3>
                                <p class="event-description">${evt.desc}</p>
                                <div class="event-details">
                                    <span class="event-time"><i class="fas fa-clock"></i> ${evt.time}</span>
                                    <span class="event-location"><i class="fas fa-map-marker-alt"></i> ${evt.location}</span>
                                </div>
                                <div class="event-tags">
                                    ${tagsHtml}
                                </div>
                            </div>
                        `;
                        eventsGrid.appendChild(card);
                    });
                })
                .catch(error => {
                    console.error('Erro ao carregar eventos públicos:', error);
                    eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Erro ao carregar eventos.</p>';
                });
        }
    }

    // === LÓGICA PARA admin-eventos.html ===
    if (isAdminPage) {
        // Lógica de Login Simples
        const loginScreen = document.getElementById('login-screen');
        const adminPanel = document.getElementById('admin-panel');
        const btnLogin = document.getElementById('btn-login');
        const passInput = document.getElementById('admin-password');
        const loginError = document.getElementById('login-error');
        const btnLogout = document.getElementById('btn-logout');

        // Senha simples para demonstração
        const ADMIN_PASS = 'capoeira2025';

        // Verifica se já está logado na sessão
        if (sessionStorage.getItem('admin_logged') === 'true') {
            showAdminPanel();
        }

        btnLogin.addEventListener('click', () => {
            if (passInput.value === ADMIN_PASS) {
                sessionStorage.setItem('admin_logged', 'true');
                showAdminPanel();
            } else {
                loginError.style.display = 'block';
            }
        });

        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('admin_logged');
            loginScreen.style.display = 'block';
            adminPanel.style.display = 'none';
            passInput.value = '';
            loginError.style.display = 'none';
        });

        function showAdminPanel() {
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'block';
            renderAdminEvents().catch(error => console.error('Erro ao renderizar eventos admin:', error));
        }

        // Estado do formulário (adicionar ou editar)
        let editingEventId = null;

        // Formulário de Adicionar/Editar
        const addForm = document.getElementById('add-event-form');
        const formTitle = document.querySelector('.admin-form h3');
        const submitBtn = addForm.querySelector('button[type="submit"]');
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        cancelBtn.style.display = 'none';
        cancelBtn.style.marginTop = '1rem';
        cancelBtn.style.marginLeft = '0.5rem';
        submitBtn.parentNode.appendChild(cancelBtn);

        cancelBtn.addEventListener('click', () => {
            resetForm();
        });

        function resetForm() {
            editingEventId = null;
            addForm.reset();
            formTitle.textContent = 'Adicionar Novo Evento';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Evento';
            cancelBtn.style.display = 'none';
        }

        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const eventData = {
                title: document.getElementById('event-title').value,
                day: document.getElementById('event-day').value,
                month: document.getElementById('event-month').value,
                desc: document.getElementById('event-desc').value,
                time: document.getElementById('event-time').value,
                location: document.getElementById('event-location').value,
                tags: document.getElementById('event-tags').value.split(',').map(t => t.trim()),
                featured: document.getElementById('event-featured').checked
            };

            try {
                if (editingEventId) {
                    // Editar evento existente
                    await updateEvent(editingEventId, eventData);
                    alert('Evento atualizado com sucesso!');
                } else {
                    // Adicionar novo evento
                    await createEvent(eventData);
                    alert('Evento adicionado com sucesso!');
                }

                resetForm();
                await renderAdminEvents();
            } catch (error) {
                console.error('Erro ao salvar evento:', error);
                alert('Erro ao salvar evento. Tente novamente.');
            }
        });

        // Renderizar lista de administração
        async function renderAdminEvents() {
            const listContainer = document.getElementById('admin-events-list');
            listContainer.innerHTML = ''; // Limpar lista anterior
            let events = [];

            try {
                events = await getEvents();
            } catch (error) {
                console.error('Erro ao carregar eventos do servidor:', error);
                listContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-light);">Não foi possível carregar os eventos. Verifique a conexão com o servidor.</div>';
                return;
            }

            if (!events || events.length === 0) {
                listContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-light);">Nenhum evento encontrado.</div>';
                return;
            }

            events.forEach(evt => {
                const item = document.createElement('div');
                item.className = 'event-list-item';

                // Tratar html no dia
                const displayDay = evt.day.replace(/<br>/g, ' ');

                item.innerHTML = `
                    <div class="event-info">
                        <h4>${evt.title} ${evt.featured ? '<span style="font-size:0.7rem; background:gold; color:black; padding:2px 5px; border-radius:3px; vertical-align:middle;">Destaque</span>' : ''}</h4>
                        <p style="font-size: 0.9rem; color: var(--text-light); margin: 0;">
                            ${displayDay} ${evt.month} | ${evt.time} | ${evt.location}
                        </p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-secondary btn-edit" data-id="${evt.id}" title="Editar evento"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-danger btn-remove" data-id="${evt.id}" title="Remover evento"><i class="fas fa-trash"></i> Remover</button>
                    </div>
                `;
                listContainer.appendChild(item);
            });

            // Adicionar eventos de click aos botões
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    editEvent(id);
                });
            });

            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if(confirm('Tem certeza que deseja remover este evento?')) {
                        removeEvent(id);
                    }
                });
            });
        }

        function editEvent(id) {
            const events = getEvents();
            const event = events.find(e => e.id === id);
            if (!event) return;

            // Preencher o formulário
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-day').value = event.day;
            document.getElementById('event-month').value = event.month;
            document.getElementById('event-desc').value = event.desc;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-tags').value = event.tags.join(', ');
            document.getElementById('event-featured').checked = event.featured;

            // Alterar estado para edição
            editingEventId = id;
            formTitle.textContent = 'Editar Evento';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Evento';
            cancelBtn.style.display = 'inline-block';

            // Scroll para o formulário
            document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
        }

        function removeEvent(id) {
            deleteEvent(id)
                .then(() => {
                    renderAdminEvents().catch(error => console.error('Erro ao renderizar eventos após remoção:', error));
                })
                .catch(error => {
                    console.error('Erro ao remover evento:', error);
                    alert('Erro ao remover evento. Tente novamente.');
                });
        }
    }
});
