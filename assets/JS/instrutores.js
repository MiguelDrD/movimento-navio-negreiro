document.addEventListener('DOMContentLoaded', () => {
    // Instrutores padrão iniciais
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

    // Carregar instrutores do LocalStorage ou usar os padrões
    function getInstructors() {
        const stored = localStorage.getItem('navio_negreiro_instructors');
        if (stored) {
            return JSON.parse(stored);
        } else {
            // Salva os padrões na primeira vez
            localStorage.setItem('navio_negreiro_instructors', JSON.stringify(defaultInstructors));
            return defaultInstructors;
        }
    }

    // Salvar instrutores no LocalStorage
    function saveInstructors(instructors) {
        localStorage.setItem('navio_negreiro_instructors', JSON.stringify(instructors));
    }

    const currentPage = window.location.pathname;
    const isAdminPage = currentPage.includes('admin-instrutores.html');

    // === LÓGICA PARA instrutores.html ===
    if (!isAdminPage) {
        const instructorsGrid = document.querySelector('.instructors-grid');
        if (instructorsGrid) {
            renderPublicInstructors();
        }

        function renderPublicInstructors() {
            const instructors = getInstructors();
            if (!instructorsGrid) return;
            
            instructorsGrid.innerHTML = '';

            // Renderizar não-principais
            instructors.filter(i => !i.isMainInstructor).forEach(instr => {
                const card = document.createElement('div');
                card.className = 'instructor-card';
                
                const specialtiesHtml = instr.specialties.filter(s => s.trim() !== '').map(spec => `<span class="specialty">${spec.trim()}</span>`).join('');
                
                card.innerHTML = `
                    <div class="instructor-photo">
                        <img src="${instr.image}" alt="${instr.name}" class="instructor-card-img">
                        <div class="instructor-overlay">
                            <div class="instructor-social">
                                ${instr.instagram && instr.instagram !== '#' ? `<a href="${instr.instagram}" class="social-link" target="_blank"><i class="fab fa-instagram"></i></a>` : '<a href="#" class="social-link" style="opacity:0.3; pointer-events:none;"><i class="fab fa-instagram"></i></a>'}
                                ${instr.facebook && instr.facebook !== '#' ? `<a href="${instr.facebook}" class="social-link" target="_blank"><i class="fab fa-facebook"></i></a>` : '<a href="#" class="social-link" style="opacity:0.3; pointer-events:none;"><i class="fab fa-facebook"></i></a>'}
                            </div>
                        </div>
                    </div>
                    <div class="instructor-details">
                        <h3>${instr.name}</h3>
                        <p class="instructor-role">${instr.role}</p>
                        <div class="instructor-cord-small">
                            <span class="cord-color" style="background: ${instr.cordStyle};"></span>
                            <span>${instr.cordName}</span>
                        </div>
                        <p class="instructor-description">${instr.description}</p>
                        <div class="instructor-specialties">
                            ${specialtiesHtml}
                        </div>
                    </div>
                `;
                instructorsGrid.appendChild(card);
            });
        }
    }

    // === LÓGICA PARA admin-instrutores.html ===
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
            renderAdminInstructors();
        }

        // Estado do formulário (adicionar ou editar)
        let editingInstructorId = null;

        // Formulário de Adicionar/Editar
        const addForm = document.getElementById('add-instructor-form');
        const formTitle = document.querySelector('.admin-form h3');
        const saveButton = document.getElementById('save-instructor-btn');
        const submitBtn = addForm.querySelector('button[type="submit"]') || saveButton;
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        cancelBtn.style.display = 'none';
        cancelBtn.style.marginTop = '1rem';
        cancelBtn.style.marginLeft = '0.5rem';
        if (submitBtn && submitBtn.parentNode) {
            submitBtn.parentNode.appendChild(cancelBtn);
        }

        cancelBtn.addEventListener('click', () => {
            resetForm();
        });

        function resetForm() {
            editingInstructorId = null;
            addForm.reset();
            formTitle.textContent = 'Adicionar Novo Instrutor';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Instrutor';
            cancelBtn.style.display = 'none';
        }

        // Usar event listener de click no botão em vez de submit no formulário
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                // Extrair valores ANTES de qualquer operação
                const nameValue = document.getElementById('instructor-name').value.trim();
                const titleValue = document.getElementById('instructor-title').value.trim();
                const roleValue = document.getElementById('instructor-role').value.trim();
                const imageValue = document.getElementById('instructor-image').value.trim();
                const instagramValue = document.getElementById('instructor-instagram').value.trim() || '#';
                const facebookValue = document.getElementById('instructor-facebook').value.trim() || '#';
                const descriptionValue = document.getElementById('instructor-description').value.trim();
                const specialtiesValue = document.getElementById('instructor-specialties').value.split(',').map(s => s.trim()).filter(s => s !== '');
                
                const cordSelect = document.getElementById('instructor-cord');
                const cordValue = cordSelect.value;
                
                // Se não houver seleção, usar um padrão
                let cordStyle = '#0000FF';
                let cordDefaultName = 'Azul';
                
                if (cordValue && cordValue !== '') {
                    const cordParts = cordValue.split('|');
                    cordStyle = cordParts[0];
                    cordDefaultName = cordParts[1] || 'Corda';
                }
                
                const cordCustomName = document.getElementById('instructor-cord-color-name').value.trim();

                const instructorData = {
                    name: nameValue,
                    title: titleValue,
                    role: roleValue,
                    cordStyle: cordStyle,
                    cordName: cordCustomName || cordDefaultName,
                    image: imageValue,
                    instagram: instagramValue,
                    facebook: facebookValue,
                    description: descriptionValue,
                    specialties: specialtiesValue,
                    isMainInstructor: false
                };

                const instructors = getInstructors();

                if (editingInstructorId) {
                    // Editar instrutor existente
                    const index = instructors.findIndex(i => i.id === editingInstructorId);
                    if (index !== -1) {
                        instructors[index] = { ...instructors[index], ...instructorData };
                        saveInstructors(instructors);
                        alert('Instrutor atualizado com sucesso!');
                    }
                } else {
                    // Adicionar novo instrutor
                    const newInstructor = {
                        id: 'instr-' + Date.now(),
                        ...instructorData
                    };
                    instructors.push(newInstructor);
                    saveInstructors(instructors);
                    alert('Instrutor adicionado com sucesso!');
                }
                
                // Resetar formulário APÓS tudo ser processado
                resetForm();
                renderAdminInstructors();
            });
        }

        // Renderizar lista de administração
        function renderAdminInstructors() {
            const listContainer = document.getElementById('admin-instructors-list');
            const instructors = getInstructors();
            listContainer.innerHTML = '';

            if (instructors.length === 0) {
                listContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-light);">Nenhum instrutor encontrado.</div>';
                return;
            }

            instructors.forEach(instr => {
                const item = document.createElement('div');
                item.className = `instructor-list-item ${instr.isMainInstructor ? 'main-instructor' : ''}`;
                
                item.innerHTML = `
                    <div class="instructor-preview">
                        <img src="${instr.image}" alt="${instr.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                        <div class="instructor-info">
                            <h4>${instr.name}${instr.isMainInstructor ? ' <span style="font-size:0.7rem; background:gold; color:black; padding:2px 5px; border-radius:3px;">(Principal)</span>' : ''}</h4>
                            <p>${instr.title} - ${instr.role}</p>
                            <div class="instructor-cord-badge">
                                <span class="cord-color" style="background: ${instr.cordStyle};"></span>
                                <span>${instr.cordName}</span>
                            </div>
                        </div>
                    </div>
                    <div class="instructor-actions">
                        <button class="btn btn-secondary btn-edit" data-id="${instr.id}" title="Editar instrutor"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn-danger btn-remove" data-id="${instr.id}" title="Remover instrutor"><i class="fas fa-trash"></i> Remover</button>
                    </div>
                `;
                listContainer.appendChild(item);
            });

            // Adicionar eventos de click aos botões
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    editInstructor(id);
                });
            });

            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const instructor = instructors.find(i => i.id === id);
                    
                    if (instructor && instructor.isMainInstructor) {
                        alert('Não é possível remover o instrutor principal (Mestre Fumaça).');
                        return;
                    }
                    
                    if(confirm('Tem certeza que deseja remover este instrutor?')) {
                        removeInstructor(id);
                    }
                });
            });
        }

        function editInstructor(id) {
            const instructors = getInstructors();
            const instructor = instructors.find(i => i.id === id);
            if (!instructor) return;

            // Preencher o formulário
            document.getElementById('instructor-name').value = instructor.name;
            document.getElementById('instructor-title').value = instructor.title;
            document.getElementById('instructor-role').value = instructor.role;
            document.getElementById('instructor-cord').value = `${instructor.cordStyle}|${instructor.cordName}`;
            document.getElementById('instructor-cord-color-name').value = instructor.cordName;
            document.getElementById('instructor-image').value = instructor.image;
            document.getElementById('instructor-instagram').value = instructor.instagram !== '#' ? instructor.instagram : '';
            document.getElementById('instructor-facebook').value = instructor.facebook !== '#' ? instructor.facebook : '';
            document.getElementById('instructor-description').value = instructor.description;
            document.getElementById('instructor-specialties').value = instructor.specialties.join(', ');

            // Alterar estado para edição
            editingInstructorId = id;
            formTitle.textContent = 'Editar Instrutor';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Instrutor';
            cancelBtn.style.display = 'inline-block';

            // Scroll para o formulário
            document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
        }

        function removeInstructor(id) {
            let instructors = getInstructors();
            instructors = instructors.filter(i => i.id !== id);
            saveInstructors(instructors);
            renderAdminInstructors();
        }
    }
});
