# Release Notes

Temos o prazer de anunciar nossa mais nova atualização, focada em aprimorar a estabilidade da plataforma e oferecer mais ferramentas para o gerenciamento de conteúdo por parte dos professores, além de grandes melhorias de infraestrutura em nossa API.

## 🚀 Novidades e Melhorias

### Novo Fluxo de Upload de Vídeos para Professores
Simplificamos a forma como os professores adicionam conteúdo! Agora é possível fazer o upload direto de arquivos de vídeo a partir do seu dispositivo, sem a necessidade de depender de links externos.
- **Feedback Visual**: Novo indicador visual de "Enviando Vídeo..." durante o upload.
- **Tratamento de Arquivos Grandes**: Mensagens de erro amigáveis caso o vídeo exceda o limite de tamanho permitido.
- **Flexibilidade Mantida**: A opção de adicionar links externos e documentos continua disponível e foi otimizada.

### Otimização de Performance na Plataforma
Nossa API recebeu uma atualização significativa para lidar melhor com grandes volumes de dados.
- **Paginação Real**: A listagem de aulas e conteúdos da biblioteca agora utiliza paginação real (navegação por páginas), substituindo os limites fixos antigos. Isso garante um carregamento muito mais rápido da plataforma, economizando dados e processamento.
- **Validação de Dados**: Adicionadas validações robustas em nossas requisições para evitar que dados incorretos causem lentidão ou comportamentos inesperados.

## 🔮 O que vem por aí? (Roadmap Atualizado)
Estamos trabalhando em recursos incríveis para as próximas versões! Nosso planejamento inclui:
- **Video Analytics**: Métricas detalhadas de visualização (tempo assistido, pausas, repetições).
- **Recursos de Aprendizado Avançado**: Modo Câmera Lenta, Loop de Trechos, Comparação Lado a Lado e suporte a Múltiplos Ângulos.
- **Acessibilidade e Usabilidade**: Melhorias contínuas para facilitar navegação via teclado e compatibilidade com leitores de tela.
- **Playback Offline**.

## 🐛 Correções de Bugs
- Corrigida a obrigatoriedade da URL ao tentar criar conteúdos, permitindo que o sistema agora lide perfeitamente com uploads diretos ou conteúdos baseados em link/documento sem falhas.

---
**Nota para Desenvolvedores:** A estrutura de retorno das rotas de listagem (`/content/library` e `/lessons`) foi alterada de um *array* direto para um objeto contendo `{ data, pagination }`. Certifiquem-se de que os clientes estão apontando para o envelope `data`.
