# Instruções de Execução - Kanban App

## 🚀 Execução com Docker Compose (Recomendado)

### Pré-requisitos
- Docker instalado
- Docker Compose instalado
- Portas 8000 e 5173 livres

### Passos para Execução

1. **Clone ou baixe o projeto**:
```bash
git clone <repository-url>
cd kanban-app
```

2. **Execute o comando de build e start**:
```bash
docker-compose up --build
```

3. **Aguarde a inicialização**:
   - O backend será executado na porta 8000
   - O frontend será executado na porta 5173
   - As migrações do banco serão executadas automaticamente

4. **Acesse a aplicação**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Admin Django: http://localhost:8000/admin

### Comandos Úteis

```bash
# Parar os containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Ver logs
docker-compose logs -f

# Rebuild completo
docker-compose up --build --force-recreate
```

## 🛠️ Execução Manual (Desenvolvimento)

### Backend (Django)

#### Pré-requisitos
- Python 3.11+
- pip

#### Passos

1. **Navegue para o diretório backend**:
```bash
cd backend
```

2. **Crie um ambiente virtual**:
```bash
# Linux/Mac
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
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

O backend estará disponível em: http://localhost:8000

### Frontend (React)

#### Pré-requisitos
- Node.js 18+
- npm

#### Passos

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

O frontend estará disponível em: http://localhost:5173

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

#### Backend
Crie um arquivo `.env` no diretório `backend/`:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Frontend
Crie um arquivo `.env` no diretório `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

### Banco de Dados

#### SQLite (Padrão)
O sistema usa SQLite por padrão. O arquivo `db.sqlite3` será criado automaticamente.

#### PostgreSQL (Opcional)
Para usar PostgreSQL:

1. **Instale o PostgreSQL**
2. **Atualize `backend/server/settings.py`**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'kanban',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

3. **Execute as migrações**:
```bash
python manage.py migrate
```

## 🐛 Solução de Problemas

### Problemas Comuns

#### Erro de Porta em Uso
```bash
# Verificar processos usando as portas
# Linux/Mac
lsof -i :8000
lsof -i :5173

# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Matar processo (substitua PID pelo número do processo)
# Linux/Mac
kill -9 PID

# Windows
taskkill /PID PID /F
```

#### Erro de CORS
- Verifique se o backend está rodando na porta 8000
- Confirme as configurações de CORS em `backend/server/settings.py`

#### Erro de Dependências
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
npm install --force
```

#### Problemas com Docker
```bash
# Limpar containers e volumes
docker-compose down -v
docker system prune -a

# Rebuild completo
docker-compose up --build --force-recreate
```

### Logs e Debug

#### Backend
```bash
# Ver logs do Django
python manage.py runserver --verbosity=2

# Ver logs do Docker
docker-compose logs backend
```

#### Frontend
```bash
# Ver logs do Vite
npm run dev -- --debug

# Ver logs do Docker
docker-compose logs frontend
```

## 📊 Verificação da Instalação

### Checklist de Verificação

- [ ] Backend rodando em http://localhost:8000
- [ ] Frontend rodando em http://localhost:5173
- [ ] API respondendo em http://localhost:8000/api
- [ ] Admin Django acessível em http://localhost:8000/admin
- [ ] Banco de dados criado e migrado
- [ ] CORS configurado corretamente
- [ ] JWT funcionando (teste de login)

### Testes Básicos

1. **Teste de API**:
```bash
curl http://localhost:8000/api/boards/
```

2. **Teste de Frontend**:
   - Acesse http://localhost:5173
   - Tente criar uma conta
   - Faça login
   - Crie um board

3. **Teste de Drag & Drop**:
   - Crie listas e cards
   - Teste arrastar cards entre listas

## 🚀 Deploy em Produção

### Configurações de Produção

#### Backend
```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
SECRET_KEY = 'your-production-secret-key'
```

#### Frontend
```bash
# Build para produção
npm run build
```

#### Docker
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - DEBUG=False
      - SECRET_KEY=your-production-secret-key
    volumes:
      - backend_data:/app/data
  
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    volumes:
      - frontend_data:/app/dist
```

## 📝 Comandos Úteis

### Desenvolvimento
```bash
# Backend
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic
python manage.py shell

# Frontend
npm run build
npm run preview
npm run lint
```

### Docker
```bash
# Executar comandos no container
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run build

# Backup do banco
docker-compose exec backend python manage.py dumpdata > backup.json

# Restore do banco
docker-compose exec backend python manage.py loaddata backup.json
```

## 🆘 Suporte

Se você encontrar problemas:

1. **Verifique os logs** dos containers
2. **Consulte a documentação** do Django e React
3. **Verifique as configurações** de rede e firewall
4. **Entre em contato** com o suporte técnico

---

**Boa sorte com sua instalação! 🚀**
