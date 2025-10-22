# 🚀 Deploy no Render - Guia Completo

## **📋 PRÉ-REQUISITOS**

- [x] Conta no GitHub
- [x] Conta no Render (gratuita)
- [x] Código no repositório GitHub

## **🔧 ARQUIVOS CRIADOS PARA DEPLOY**

### **Arquivos de Configuração:**
- `render.yaml` - Configuração do Render
- `Dockerfile.render` - Dockerfile para produção
- `nginx.render.conf` - Configuração do Nginx
- `start.render.sh` - Script de inicialização
- `env.example` - Exemplo de variáveis de ambiente

### **Arquivos Atualizados:**
- `backend/server/settings.py` - Configurações de produção
- `backend/server/urls.py` - URLs para produção
- `frontend/vite.config.ts` - Build otimizado
- `.gitignore` - Ignorar arquivos do Render

## **🚀 PROCESSO DE DEPLOY**

### **1. Preparar o Código**
```bash
# Fazer commit de todos os arquivos
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### **2. Criar Conta no Render**
1. Acesse [render.com](https://render.com)
2. Clique em "Get Started for Free"
3. Selecione "Sign up with GitHub"
4. Autorize o Render a acessar seu GitHub

### **3. Criar Serviço Web**
1. No dashboard do Render, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório `kanban-app`
4. Configure:
   - **Name**: `kanban-app`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile.render`
   - **Plan**: `Free`
   - **Region**: `Oregon (US West)`

### **4. Configurar Variáveis de Ambiente**

#### **Opção A: Dashboard do Render (Recomendado)**
Na seção "Environment Variables", adicione:
- `DEBUG` = `False`
- `SECRET_KEY` = `sua-chave-secreta-aqui`
- `ALLOWED_HOSTS` = `*.onrender.com`
- `CORS_ALLOWED_ORIGINS` = `https://*.onrender.com`
- `DATABASE_URL` = `sqlite:///db/db.sqlite3`

#### **Opção B: Arquivo .env (Opcional)**
1. Copie o arquivo de exemplo: `cp env.example .env`
2. Edite o `.env` com seus valores
3. Configure as mesmas variáveis no dashboard do Render
4. **NUNCA** commite o arquivo `.env` (está no .gitignore)

### **5. Fazer Deploy**
1. Clique em "Create Web Service"
2. Aguarde o build terminar (10-15 minutos)
3. Acesse o domínio gerado (ex: `kanban-app.onrender.com`)

## **🔍 VERIFICAÇÃO DO DEPLOY**

### **Testes Básicos:**
- [ ] Aplicação carrega sem erros
- [ ] Login/Registro funcionam
- [ ] Criação de boards funciona
- [ ] Drag & drop das listas funciona
- [ ] Upload de imagens funciona
- [ ] Todas as funcionalidades estão operacionais

### **Logs e Monitoramento:**
- Acesse "Logs" no dashboard do Render
- Monitore erros e performance
- Verifique uso de recursos

## **🌐 CONFIGURAÇÃO DE DOMÍNIO PERSONALIZADO**

### **1. Comprar Domínio**
- **Registro.br** (Brasil)
- **GoDaddy**
- **Namecheap**

### **2. Configurar DNS**
```
Tipo: CNAME
Nome: www
Valor: kanban-app.onrender.com

Tipo: A
Nome: @
Valor: IP_DO_RENDER
```

### **3. Adicionar no Render**
1. No Render, vá para "Settings"
2. Em "Custom Domains", clique em "Add Custom Domain"
3. Digite seu domínio
4. Configure o SSL (automático)

## **📊 MONITORAMENTO E MANUTENÇÃO**

### **Backup Automático:**
- O Render faz backup automático dos dados
- Banco de dados SQLite é persistente
- Arquivos de mídia são mantidos

### **Atualizações:**
```bash
# Fazer mudanças no código
git add .
git commit -m "Update feature"
git push origin main

# O Render fará deploy automático
```

### **Logs:**
- Acesse "Logs" no dashboard
- Monitore performance e erros
- Configure alertas se necessário

## **🔧 TROUBLESHOOTING**

### **Problemas Comuns:**

#### **1. Build Falha**
- Verifique se todos os arquivos estão no repositório
- Confirme se o Dockerfile.render está correto
- Verifique os logs de build

#### **2. Aplicação Não Carrega**
- Verifique as variáveis de ambiente
- Confirme se o ALLOWED_HOSTS está correto
- Verifique os logs de runtime

#### **3. Erro de CORS**
- Confirme se CORS_ALLOWED_ORIGINS está correto
- Verifique se o domínio está incluído

#### **4. Banco de Dados**
- Verifique se o diretório /db existe
- Confirme se as migrações foram aplicadas
- Verifique os logs do Django

## **💰 CUSTOS**

### **Plano Gratuito:**
- **750 horas/mês** de execução
- **512MB RAM**
- **1 CPU**
- **Domínio .onrender.com**
- **SSL gratuito**

### **Limitações:**
- Aplicação "dorme" após 15 minutos de inatividade
- Primeira requisição pode demorar alguns segundos
- Limite de 750 horas/mês

## **🎯 PRÓXIMOS PASSOS**

1. **Testar todas as funcionalidades**
2. **Configurar domínio personalizado**
3. **Configurar backup automático**
4. **Monitorar performance**
5. **Considerar upgrade para plano pago** (se necessário)

## **📞 SUPORTE**

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Render Support**: [render.com/support](https://render.com/support)
- **GitHub Issues**: [github.com/seu-usuario/kanban-app/issues](https://github.com/seu-usuario/kanban-app/issues)

---

**🎉 Parabéns! Sua aplicação está online!** 🚀
