# 🚀 Como Executar o Kanban App

## ⚡ Execução Rápida (Docker)

### 1. Clone o projeto
```bash
git clone <repository-url>
cd kanban-app
```

### 2. Execute com Docker
```bash
docker-compose up --build
```

### 3. Acesse a aplicação
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000/api
- **Admin**: http://localhost:8000/admin

## 🎯 Primeiros Passos

### 1. Criar sua conta
1. Acesse http://localhost:5173
2. Clique em "Sign up"
3. Preencha o formulário
4. Faça login

### 2. Criar seu primeiro board
1. No Dashboard, clique em "Create Board"
2. Digite o nome do projeto
3. Clique em "Create Board"

### 3. Organizar tarefas
1. Clique em "Add a list" para criar listas
2. Clique em "Add a card" para criar tarefas
3. Arraste cards entre listas para organizar

## 🛠️ Comandos Úteis

```bash
# Parar os containers
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild completo
docker-compose up --build --force-recreate

# Executar comandos no container
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run build
```

## 📚 Documentação

- **README.md** - Visão geral do projeto
- **MANUAL_USUARIO.md** - Manual completo do usuário
- **INSTRUCOES_EXECUCAO.md** - Instruções detalhadas
- **CHECKLIST_FINAL.md** - Verificação do projeto

## 🆘 Problemas?

1. **Porta em uso**: Verifique se as portas 8000 e 5173 estão livres
2. **Erro de build**: Execute `docker-compose down -v` e tente novamente
3. **CORS**: Verifique se o backend está rodando na porta 8000

## 🎉 Pronto!

Seu sistema Kanban está funcionando! Crie boards, organize tarefas e colabore com sua equipe.

---

**Desenvolvido com ❤️ usando React, Django e Docker**
