# 🎬 I Tube - YouTube Moderno

Um player de vídeos do YouTube com design moderno, sistema de temas avançado e funcionalidades inovadoras.

## ✨ Funcionalidades

### 🎨 Sistema de Temas Avançado
- **12 combinações de temas**: 6 cores × 2 modos (claro/escuro)
- **Modo Claro**: Verde, Vermelho, Azul, Roxo, Laranja, Rosa
- **Modo Escuro**: Versões escuras de todas as cores
- **Preview em tempo real** das configurações
- **Persistência completa** das preferências (localStorage)
- **Transições suaves** entre temas
- **Página de configurações** dedicada com interface intuitiva

### 🎨 Design Moderno
- **Gradientes vibrantes** com cores personalizáveis
- **Animações suaves** e efeitos hover
- **Design responsivo** para todos os dispositivos
- **Tipografia moderna** com fonte Inter
- **Efeitos de vidro** (glassmorphism) nos elementos

### 🔍 Busca Inteligente
- Busca em tempo real com feedback visual
- Suporte a busca por Enter
- Estados de carregamento com spinner animado
- Tratamento de erros elegante

### 📺 Player Avançado
- Player de vídeo integrado com controles completos
- **Popup Player**: Assista vídeos enquanto navega pela aplicação
- **Player flutuante**: Redimensionável, arrastável e minimizável
- Botões de navegação (voltar, favoritar, compartilhar, popup)
- Informações detalhadas do vídeo
- Autoplay otimizado
- **Multitarefa**: Navegue livremente com vídeos rodando no popup

### 🎵 Playlists
- Crie playlists nomeadas e salvas no navegador (localStorage)
- Adicione vídeos às playlists a partir dos cards, player ou popup
- Página dedicada para listar e tocar playlists
- Reprodução em ordem de adição com botão Próximo
- **Integração com popup**: Gerencie playlists enquanto assiste

### ❤️ Sistema de Favoritos
- Adicionar/remover vídeos dos favoritos
- **Controle do popup**: Favoritar diretamente do player flutuante
- Persistência local (localStorage)
- Visualização dos favoritos
- Animação de coração pulsante
- **Sincronização**: Favoritos sincronizados entre player principal e popup

### 📊 Metadados dos Vídeos
- Contagem de visualizações formatada
- Data de publicação
- Nome do canal
- Thumbnails otimizadas

### 📱 Responsividade
- Layout adaptativo para mobile e desktop
- Grid responsivo para vídeos
- Controles otimizados para touch
- Design mobile-first
- **Popup responsivo**: Adapta-se a diferentes tamanhos de tela
- **Controles touch**: Drag, resize e interações otimizadas para mobile

## 🚀 Como Usar

### 🎨 Personalização
1. **Escolher tema**: Clique no botão ⚙️ no canto superior direito
2. **Modo claro/escuro**: Selecione o modo de exibição desejado
3. **Cores personalizadas**: Escolha entre 6 cores disponíveis
4. **Preview em tempo real**: Veja as mudanças instantaneamente

### 📺 Reprodução de Vídeos
5. **Reproduzir**: Clique em qualquer vídeo para reproduzi-lo
6. **Popup Player**: Clique no botão 📱 para abrir em popup
7. **Multitarefa**: Navegue livremente com vídeos rodando no popup
8. **Controles do popup**: Arraste, redimensione, minimize ou maximize

### 🎵 Organização
9. **Playlists**: Clique no botão 🎵 para criar e tocar playlists
10. **Favoritar**: Clique no coração para adicionar aos favoritos
11. **Buscar vídeos**: Digite na barra de busca e pressione Enter
12. **Compartilhar**: Use o botão de compartilhamento no player

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Design moderno com gradientes e animações
- **JavaScript ES6+** - Funcionalidades interativas
- **YouTube Data API v3** - Integração com YouTube
- **LocalStorage** - Persistência de dados

## 📋 Recursos Implementados

### 🎨 Sistema de Temas
- ✅ **12 combinações de temas** (6 cores × 2 modos)
- ✅ **Modo claro e escuro** com cores personalizáveis
- ✅ **Página de configurações** dedicada e intuitiva
- ✅ **Preview em tempo real** das configurações
- ✅ **Persistência completa** das preferências
- ✅ **Transições suaves** entre temas

### 📺 Player e Reprodução
- ✅ **Player de vídeo** com controles avançados
- ✅ **Popup Player** flutuante e redimensionável
- ✅ **Sistema de drag & drop** para mover o popup
- ✅ **Redimensionamento inteligente** com limites
- ✅ **Estados do popup** (normal, minimizado, maximizado)
- ✅ **Multitarefa** - navegue enquanto assiste

### 🎵 Organização e Favoritos
- ✅ **Sistema de favoritos** com persistência
- ✅ **Playlists personalizadas** com gerenciamento completo
- ✅ **Integração popup** - controle de favoritos e playlists
- ✅ **Sincronização** entre player principal e popup

### 🎨 Design e UX
- ✅ **Design visual moderno** com glassmorphism
- ✅ **Gradientes personalizáveis** por tema
- ✅ **Animações e transições** suaves
- ✅ **Design responsivo** completo
- ✅ **Estados de carregamento** com feedback visual
- ✅ **Tratamento de erros** elegante

### 🔧 Funcionalidades Técnicas
- ✅ **YouTube Data API v3** integração completa
- ✅ **LocalStorage** para persistência de dados
- ✅ **Sistema de drag & drop** nativo
- ✅ **Event listeners** otimizados
- ✅ **Performance** otimizada

## 🎯 Melhorias Futuras

- [ ] Histórico de visualizações
- [ ] Busca por categoria
- [ ] Recomendações personalizadas
- [ ] Download de vídeos (se permitido)
- [ ] Controles de teclado para o popup
- [ ] Múltiplos popups simultâneos
- [ ] Temas personalizados pelo usuário
- [ ] Modo cinema para o popup

## 📝 Notas

- Certifique-se de ter uma chave válida da YouTube Data API v3
- O projeto é totalmente client-side (não requer servidor)
- Compatível com navegadores modernos
- Otimizado para performance e UX
- **Popup Player**: Funciona melhor em telas maiores (recomendado 1024px+)
- **Temas**: As configurações são salvas automaticamente no navegador

## 🎮 Controles do Popup Player

- **Mover**: Arraste pelo cabeçalho do popup
- **Redimensionar**: Use o canto inferior direito
- **Minimizar**: Botão ➖ (mostra apenas o cabeçalho)
- **Maximizar**: Botão ⛶ (ocupa 90% da tela)
- **Fechar**: Botão ✕ (fecha o popup)

## 🎨 Temas Disponíveis

### Modo Claro
- 🌿 Verde, ❤️ Vermelho, 💙 Azul, 💜 Roxo, 🧡 Laranja, 💖 Rosa

### Modo Escuro  
- 🌿 Verde, ❤️ Vermelho, 💙 Azul, 💜 Roxo, 🧡 Laranja, 💖 Rosa

---

**Desenvolvido com ❤️ para uma experiência de vídeo moderna, intuitiva e multitarefa!**
