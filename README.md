# Kanban App - Sistema Completo Trello-like

Um sistema completo de gerenciamento de tarefas estilo Trello, desenvolvido com React + Vite + TypeScript no frontend e Django + DRF no backend.

## 🚀 Funcionalidades

- **Autenticação completa**: Cadastro, login e JWT (Access/Refresh tokens)
- **Boards**: Criação e gerenciamento de quadros
- **Lists**: Listas organizadas dentro dos boards
- **Cards**: Cartões com título, descrição e labels
- **Drag & Drop**: Arrastar e soltar cards entre listas
- **Labels**: Sistema de etiquetas coloridas
- **Comentários**: Comentários nos cards
- **Membros**: Sistema de membros com diferentes roles
- **Interface moderna**: Design responsivo com Tailwind CSS

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router (navegação)
- TanStack Query (cache e sincronização)
- @hello-pangea/dnd (drag & drop)
- Axios (HTTP client)

### Backend
- Django 4.2 + Django REST Framework
- SimpleJWT (autenticação)
- SQLite (banco de dados)
- django-cors-headers (CORS)

### DevOps
- Docker + Docker Compose
- Volumes persistentes para dados

## 📁 Estrutura do Projeto

```
kanban-app/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── server/
│       ├── settings.py
│       └── urls.py
│   └── kanban/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── permissions.py
│       └── admin.py
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   └── utils.ts
│       ├── types/
│       │   └── index.ts
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   └── BoardPage.tsx
│       └── components/
│           ├── ui/
│           ├── Board.tsx
│           ├── Column.tsx
│           └── CardItem.tsx
├── docker-compose.yml
└── README.md
```

## 🚀 Como Executar

### Opção 1: Docker Compose (Recomendado)

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd kanban-app
```

2. **Execute com Docker Compose**:
```bash
docker-compose up --build
```

3. **Acesse a aplicação**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Django: http://localhost:8000/admin

### Opção 2: Execução Manual

#### Backend (Django)

1. **Navegue para o diretório backend**:
```bash
cd backend
```

2. **Crie um ambiente virtual**:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Instale as dependências**:
```bash
pip install -r requirements.txt
```

4. **Execute as migrações**:
```bash
python manage.py migrate
```

5. **Crie um superusuário (opcional)**:
```bash
python manage.py createsuperuser
```

6. **Execute o servidor**:
```bash
python manage.py runserver
```

#### Frontend (React)

1. **Navegue para o diretório frontend**:
```bash
cd frontend
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Execute o servidor de desenvolvimento**:
```bash
npm run dev
```

## 📖 Manual do Usuário

### 1. Primeiro Acesso

1. Acesse http://localhost:5173
2. Clique em "Sign up" para criar uma conta
3. Preencha os dados: nome, username, email e senha
4. Após o cadastro, você será redirecionado automaticamente

### 2. Criando seu Primeiro Board

1. No Dashboard, clique em "Create Board"
2. Digite o título do board
3. Adicione uma descrição (opcional)
4. Clique em "Create Board"

### 3. Organizando com Lists

1. Abra seu board
2. Clique em "Add a list" no final das listas existentes
3. Digite o nome da lista (ex: "To Do", "In Progress", "Done")
4. Pressione Enter ou clique em "Add List"

### 4. Criando Cards

1. Dentro de uma lista, clique em "Add a card"
2. Digite o título do card
3. Pressione Enter ou clique em "Add Card"
4. Clique no card para adicionar descrição, labels e comentários

### 5. Drag & Drop

1. Clique e arraste qualquer card
2. Solte em outra lista para movê-lo
3. A posição será automaticamente salva

### 6. Gerenciando Labels

1. Abra um card
2. Use a seção "Labels" para adicionar etiquetas coloridas
3. As labels ajudam a categorizar e organizar os cards

### 7. Comentários

1. Abra um card
2. Na seção "Comments", adicione observações
3. Útil para discussões e histórico de mudanças

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

#### Backend
- `DEBUG`: Modo debug (True/False)
- `SECRET_KEY`: Chave secreta do Django
- `ALLOWED_HOSTS`: Hosts permitidos

#### Frontend
- `VITE_API_URL`: URL da API backend

### Banco de Dados

O sistema usa SQLite por padrão. Para usar PostgreSQL:

1. Instale o PostgreSQL
2. Atualize as configurações em `backend/server/settings.py`
3. Execute as migrações

## 🐛 Solução de Problemas

### Erro de CORS
- Verifique se o backend está rodando na porta 8000
- Confirme as configurações de CORS no Django

### Erro de Autenticação
- Verifique se os tokens JWT estão sendo salvos no localStorage
- Confirme se o refresh token está funcionando

### Problemas com Docker
- Execute `docker-compose down` e `docker-compose up --build`
- Verifique se as portas 8000 e 5173 estão livres

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/token/` - Login
- `POST /api/auth/token/refresh/` - Refresh token
- `POST /api/register/` - Registro

### Boards
- `GET /api/boards/` - Listar boards
- `POST /api/boards/` - Criar board
- `GET /api/boards/{id}/` - Detalhes do board
- `PATCH /api/boards/{id}/` - Atualizar board
- `DELETE /api/boards/{id}/` - Deletar board

### Lists
- `GET /api/boards/{id}/lists/` - Listar listas
- `POST /api/boards/{id}/lists/` - Criar lista
- `PATCH /api/boards/{id}/lists/{id}/` - Atualizar lista
- `DELETE /api/boards/{id}/lists/{id}/` - Deletar lista

### Cards
- `GET /api/lists/{id}/cards/` - Listar cards
- `POST /api/lists/{id}/cards/` - Criar card
- `PATCH /api/lists/{id}/cards/{id}/` - Atualizar card
- `DELETE /api/lists/{id}/cards/{id}/` - Deletar card
- `POST /api/cards/move/` - Mover card

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email.

---

**Desenvolvido com ❤️ usando React, Django e Docker**
