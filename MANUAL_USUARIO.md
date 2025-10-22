# Manual do Usuário - Kanban App

## 📋 Índice

1. [Introdução](#introdução)
2. [Primeiro Acesso](#primeiro-acesso)
3. [Dashboard](#dashboard)
4. [Criando e Gerenciando Boards](#criando-e-gerenciando-boards)
5. [Organizando com Lists](#organizando-com-lists)
6. [Trabalhando com Cards](#trabalhando-com-cards)
7. [Drag & Drop](#drag--drop)
8. [Labels e Categorização](#labels-e-categorização)
9. [Comentários e Colaboração](#comentários-e-colaboração)
10. [Membros e Permissões](#membros-e-permissões)
11. [Boas Práticas](#boas-práticas)
12. [Solução de Problemas](#solução-de-problemas)

## 🎯 Introdução

O Kanban App é uma ferramenta de gerenciamento de tarefas inspirada no Trello, que permite organizar projetos de forma visual e colaborativa. Com ele, você pode criar boards (quadros), organizar tarefas em listas e gerenciar o progresso através de cards.

### Principais Conceitos

- **Board**: Um quadro que representa um projeto ou área de trabalho
- **List**: Uma coluna dentro do board que representa uma etapa do processo
- **Card**: Uma tarefa individual dentro de uma lista
- **Label**: Etiquetas coloridas para categorizar cards
- **Membro**: Usuários que têm acesso ao board

## 🚀 Primeiro Acesso

### 1. Registro de Conta

1. Acesse a aplicação em `http://localhost:5173`
2. Clique em **"Sign up"** na tela de login
3. Preencha o formulário com:
   - **Nome**: Seu nome completo
   - **Username**: Nome de usuário único
   - **Email**: Seu endereço de email
   - **Senha**: Crie uma senha segura
   - **Confirmar Senha**: Digite a senha novamente
4. Clique em **"Create account"**

### 2. Login

1. Na tela de login, digite seu **username** e **senha**
2. Clique em **"Sign in"**
3. Você será redirecionado para o Dashboard

## 🏠 Dashboard

O Dashboard é sua página inicial, onde você pode:

- **Visualizar todos os seus boards**
- **Criar novos boards**
- **Acessar boards existentes**
- **Fazer logout**

### Navegação

- **Logo**: Clique para voltar ao Dashboard
- **"Create Board"**: Botão para criar um novo board
- **"Logout"**: Sair da aplicação

## 📋 Criando e Gerenciando Boards

### Criando um Board

1. No Dashboard, clique em **"Create Board"**
2. Preencha o formulário:
   - **Board Title**: Nome do seu projeto (ex: "Desenvolvimento Web")
   - **Description**: Descrição opcional do projeto
3. Clique em **"Create Board"**

### Acessando um Board

1. No Dashboard, clique no card do board desejado
2. Você será redirecionado para a página do board

### Estrutura de um Board

- **Header**: Título do board e botões de navegação
- **Lists**: Colunas organizadas horizontalmente
- **Cards**: Tarefas dentro de cada lista

## 📝 Organizando com Lists

### Criando uma Lista

1. No board, clique em **"Add a list"** no final das listas existentes
2. Digite o nome da lista (ex: "To Do", "In Progress", "Done")
3. Pressione **Enter** ou clique em **"Add List"**

### Exemplos de Listas Comuns

- **To Do**: Tarefas a serem feitas
- **In Progress**: Tarefas em andamento
- **Review**: Tarefas para revisão
- **Done**: Tarefas concluídas

### Gerenciando Listas

- **Reorganizar**: Arraste as listas para reordenar
- **Editar**: Clique no título da lista para editar
- **Deletar**: Use o menu de opções da lista

## 🎴 Trabalhando com Cards

### Criando um Card

1. Dentro de uma lista, clique em **"Add a card"**
2. Digite o título do card
3. Pressione **Enter** ou clique em **"Add Card"**

### Editando um Card

1. Clique no card desejado
2. No modal que abrir, você pode:
   - **Editar o título**
   - **Adicionar descrição**
   - **Adicionar labels**
   - **Ver comentários**

### Informações do Card

- **Título**: Nome da tarefa
- **Descrição**: Detalhes adicionais
- **Labels**: Etiquetas coloridas
- **Comentários**: Discussões e observações
- **Data de criação**: Quando foi criado
- **Criador**: Quem criou o card

## 🖱️ Drag & Drop

### Movendo Cards

1. **Clique e segure** no card que deseja mover
2. **Arraste** o card para a lista de destino
3. **Solte** o card na posição desejada
4. A posição será **automaticamente salva**

### Dicas de Drag & Drop

- **Feedback visual**: O card fica destacado durante o arraste
- **Posicionamento**: Solte entre outros cards para posicionar
- **Listas vazias**: Você pode soltar em listas vazias
- **Auto-save**: As mudanças são salvas automaticamente

## 🏷️ Labels e Categorização

### Criando Labels

1. Abra um card
2. Na seção **"Labels"**, clique em **"Add Label"**
3. Escolha uma cor e digite o nome
4. Clique em **"Create Label"**

### Usando Labels

- **Categorização**: Organize cards por tipo, prioridade ou área
- **Filtros visuais**: Identifique rapidamente diferentes tipos de tarefas
- **Cores**: Use cores consistentes para facilitar a identificação

### Exemplos de Labels

- **Prioridade**: 🔴 Alta, 🟡 Média, 🟢 Baixa
- **Tipo**: 🐛 Bug, ✨ Feature, 📝 Documentação
- **Área**: 🎨 Frontend, ⚙️ Backend, 🧪 Testes

## 💬 Comentários e Colaboração

### Adicionando Comentários

1. Abra um card
2. Na seção **"Comments"**, digite seu comentário
3. Clique em **"Add Comment"**

### Tipos de Comentários

- **Atualizações**: Informe o progresso da tarefa
- **Perguntas**: Tire dúvidas sobre a tarefa
- **Sugestões**: Proponha melhorias
- **Aprovações**: Confirme conclusões

### Boas Práticas para Comentários

- **Seja claro e objetivo**
- **Use @username para mencionar pessoas**
- **Inclua links relevantes**
- **Mantenha o histórico de decisões**

## 👥 Membros e Permissões

### Adicionando Membros

1. No board, clique em **"Add Member"**
2. Digite o username da pessoa
3. Escolha o role (Owner, Admin, Member)
4. Clique em **"Add Member"**

### Roles e Permissões

- **Owner**: Controle total do board
- **Admin**: Pode gerenciar membros e configurações
- **Member**: Pode criar e editar cards

### Gerenciando Membros

- **Visualizar**: Veja todos os membros do board
- **Editar roles**: Mude as permissões dos membros
- **Remover**: Remova membros quando necessário

## ✅ Boas Práticas

### Organização de Boards

1. **Use nomes descritivos** para boards e listas
2. **Mantenha listas simples** (máximo 5-7 listas por board)
3. **Use templates** para projetos similares
4. **Arquive boards** concluídos

### Gerenciamento de Cards

1. **Títulos claros** e objetivos
2. **Descrições detalhadas** quando necessário
3. **Labels consistentes** em todo o projeto
4. **Comentários regulares** para manter a equipe informada

### Colaboração

1. **Comunique mudanças** através de comentários
2. **Use labels** para facilitar a identificação
3. **Mantenha cards atualizados** com o progresso
4. **Revise regularmente** o status das tarefas

### Fluxo de Trabalho

1. **To Do**: Tarefas planejadas
2. **In Progress**: Tarefas sendo executadas
3. **Review**: Tarefas para revisão/aprovação
4. **Done**: Tarefas concluídas

## 🔧 Solução de Problemas

### Problemas Comuns

#### Não consigo fazer login
- Verifique se o username e senha estão corretos
- Tente criar uma nova conta se necessário
- Verifique se o backend está rodando

#### Cards não estão salvando
- Verifique sua conexão com a internet
- Recarregue a página
- Verifique se você tem permissão para editar o board

#### Drag & Drop não funciona
- Verifique se o JavaScript está habilitado
- Tente recarregar a página
- Verifique se há erros no console do navegador

#### Não consigo acessar um board
- Verifique se você é membro do board
- Peça para o owner adicionar você
- Verifique se o board ainda existe

### Dicas de Performance

1. **Evite muitos cards** em uma única lista
2. **Use labels** em vez de criar muitas listas
3. **Arquive cards** antigos quando necessário
4. **Mantenha descrições** concisas

### Suporte

Se você encontrar problemas:

1. **Verifique este manual** primeiro
2. **Recarregue a página** e tente novamente
3. **Verifique o console** do navegador para erros
4. **Entre em contato** com o administrador do sistema

## 📞 Contato e Suporte

Para suporte técnico ou dúvidas sobre o sistema:

- **Email**: suporte@kanbanapp.com
- **Documentação**: Consulte este manual
- **Issues**: Reporte problemas no repositório

---

**Versão 1.0 - Kanban App**  
*Desenvolvido com React, Django e muito ❤️*
