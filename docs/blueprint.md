# **App Name**: Rastreio Financeiro Simplificado

## Core Features:

- Entrada de Dados via Formulário Fixo: Formulário fixo para entrada de dados com campos para Tipo (Despesa, Receita), Nome (texto curto), valor (número), vencimento (data), prioridade (seletor com as prioridades: muito alta, alta, média, baixa, muito baixa).
- Classificação Dinâmica e Exibição da Tabela: Exibir uma tabela reativa de todas as transações, classificada dinamicamente por prioridade (alta para baixa), data de vencimento (mais próxima primeiro) e valor (maior primeiro).
- Totais de Moeda Múltipla: Calcular e exibir totais para receitas, despesas e saldo, discriminados por moeda. Os valores positivos são verdes, os valores negativos são vermelhos.
- Persistência de dados: Salvar localmente todos os lançamentos de razão no navegador e associar um ID único a cada entrada. Funcionalidades para 'Reset' (com confirmação), 'Remover' (exclui a linha) e 'Atualizar' (permite editar os valores na linha atual).
- Lembretes de Despesas: Agendar notificações (usando o fuso horário do navegador) para lembrar os usuários das próximas despesas. Enviar uma notificação às 12h do dia anterior ao vencimento ('Vence amanhã: <nome> - <valor>') e outra às 8h no dia do vencimento ('Vence hoje: <nome> - <valor>').

## Style Guidelines:

- Cor primária: Azul vívido (#4285F4) para transmitir confiança e estabilidade financeira.
- Cor de fundo: Azul muito claro (#E3F2FD), mantendo uma estética limpa e profissional.
- Cor de destaque: Laranja vibrante (#FFA726) para chamar a atenção para as principais ações e notificações.
- Fonte do corpo: 'PT Sans', uma fonte sans-serif, para legibilidade e clareza no texto e nos cabeçalhos.
- Use ícones distintos para cada nível de prioridade (por exemplo, setas para cima/para baixo, pontos de exclamação) para enfatizar a urgência visualmente.
- Design de layout de tabela enxuto e responsivo com espaçamento claro para garantir facilidade de uso em diferentes tamanhos de tela.
- Transições sutis e animações ao adicionar ou atualizar itens para fornecer feedback visual sem sobrecarregar o usuário.