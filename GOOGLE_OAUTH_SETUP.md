# Configuração do Google OAuth para I Tube

## Passo 1: Criar um Projeto no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google Identity Services" (anteriormente Google Sign-In API)

## Passo 2: Configurar OAuth 2.0

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Selecione "Web application"
4. Configure as URLs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost` (para desenvolvimento) e `https://seudominio.com` (para produção)
   - **Authorized redirect URIs**: `http://localhost` e `https://seudominio.com`

## Passo 3: Obter o Client ID

1. Após criar as credenciais, copie o **Client ID**
2. Substitua `YOUR_GOOGLE_CLIENT_ID` no arquivo `script.js` pela sua chave

## Passo 4: Testar a Integração

1. Abra o arquivo `index.html` em um servidor web local
2. Clique no botão "Entrar" no canto superior esquerdo
3. Faça login com sua conta Google
4. Verifique se o avatar e nome aparecem corretamente

## Funcionalidades Implementadas

### Para Usuários Logados:
- ✅ Login/Logout com Google
- ✅ Avatar e nome do usuário na interface
- ✅ Favoritos personalizados por usuário
- ✅ Playlists personalizadas por usuário
- ✅ Notificações de ações (toast messages)
- ✅ Persistência de dados entre sessões

### Para Usuários Anônimos:
- ✅ Funcionalidade básica mantida
- ✅ Favoritos e playlists locais
- ✅ Opção de fazer login a qualquer momento

## Segurança

- Os dados do usuário são armazenados apenas localmente (localStorage)
- Não há envio de dados para servidores externos além do Google
- O Client ID é público e seguro para uso no frontend

## Personalização

Você pode personalizar:
- Cores e estilos dos botões de login
- Mensagens de boas-vindas
- Ícones e avatares
- Funcionalidades específicas para usuários logados

## Suporte

Se encontrar problemas:
1. Verifique se o Client ID está correto
2. Confirme se as URLs estão configuradas no Google Console
3. Verifique o console do navegador para erros
4. Teste em um servidor web (não abra o arquivo diretamente)
