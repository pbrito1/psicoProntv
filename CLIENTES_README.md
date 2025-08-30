# Gestão de Clientes e Prontuários - PsicoPront

## Visão Geral

Esta funcionalidade permite aos terapeutas e administradores gerenciar clientes e seus respectivos prontuários médicos de forma completa e organizada.

## Funcionalidades Principais

### 1. Gestão de Clientes
- **Cadastro completo**: Nome, email, telefone, data de nascimento, endereço
- **Informações de emergência**: Contato e telefone de emergência
- **Histórico médico**: Condições médicas prévias, medicamentos atuais, alergias
- **Edição e exclusão**: Gerenciamento completo dos dados dos clientes
- **Busca**: Sistema de busca por nome ou email

### 2. Gestão de Prontuários
- **Evolução clínica**: Registro detalhado de cada sessão
- **Tipos de sessão**: Individual, Grupo ou Familiar
- **Estrutura SOAP**: 
  - **S**ubjective (Queixa principal)
  - **O**bjective (Observações objetivas)
  - **A**ssessment (Avaliação)
  - **P**lan (Plano terapêutico)
- **Informações adicionais**: Duração da sessão, observações, próxima sessão

## Como Usar

### Acessando a Funcionalidade
1. Faça login no sistema
2. No menu lateral, clique em "Clientes"
3. A tela será dividida em duas abas: "Clientes" e "Prontuários"

### Cadastrando um Novo Cliente
1. Clique no botão "Novo Cliente"
2. Preencha todos os campos obrigatórios (marcados com *)
3. Adicione informações médicas relevantes
4. Clique em "Criar"

### Criando um Prontuário
1. Selecione um cliente na aba "Clientes"
2. Vá para a aba "Prontuários"
3. Clique em "Nova Sessão"
4. Preencha os dados da sessão seguindo o formato SOAP
5. Clique em "Criar"

### Editando Informações
- **Cliente**: Clique no ícone de edição ao lado do nome do cliente
- **Prontuário**: Clique no ícone de edição ao lado da sessão

## Estrutura dos Dados

### Cliente
```typescript
interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  createdAt: string;
  updatedAt: string;
}
```

### Prontuário
```typescript
interface MedicalRecord {
  id: number;
  clientId: number;
  therapistId: number;
  sessionDate: string;
  sessionType: 'INDIVIDUAL' | 'GROUP' | 'FAMILY';
  sessionDuration: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  notes: string;
  nextSessionDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Formato SOAP

### S - Subjective (Subjetivo)
- Queixa principal do cliente
- Sintomas relatados
- História da queixa atual

### O - Objective (Objetivo)
- Observações objetivas do terapeuta
- Sinais observados
- Comportamentos durante a sessão

### A - Assessment (Avaliação)
- Hipóteses diagnósticas
- Impressão clínica
- Análise dos dados coletados

### P - Plan (Plano)
- Objetivos terapêuticos
- Intervenções planejadas
- Próximos passos

## Permissões

- **Terapeutas**: Podem visualizar, criar e editar clientes e prontuários
- **Administradores**: Acesso total a todas as funcionalidades
- **Usuários comuns**: Sem acesso a esta funcionalidade

## Dados Mock

Atualmente, o sistema está usando dados mock para demonstração:

### Clientes de Exemplo
1. **Maria Silva Santos** - Ansiedade e depressão
2. **Carlos Eduardo Oliveira** - TEPT
3. **Ana Paula Costa** - Transtorno bipolar
4. **Roberto Almeida** - Ansiedade social
5. **Fernanda Lima** - Transtorno alimentar

### Prontuários de Exemplo
- Sessões individuais com evolução clínica detalhada
- Diferentes tipos de sessão (individual, grupo, familiar)
- Exemplos de aplicação do formato SOAP

## Integração com Backend

Quando o backend estiver implementado, as funções mock serão substituídas por chamadas reais à API:

```typescript
// Atual (mock)
const { mockListClients } = await import('./mockClients');
return mockListClients();

// Futuro (API real)
const { data } = await api.get('/clients');
return data;
```

## Próximos Passos

1. **Backend**: Implementar endpoints para clientes e prontuários
2. **Banco de dados**: Criar tabelas e relacionamentos
3. **Validações**: Adicionar validações de dados
4. **Relatórios**: Gerar relatórios e estatísticas
5. **Exportação**: Permitir exportação de dados
6. **Backup**: Sistema de backup automático

## Suporte

Para dúvidas ou problemas com esta funcionalidade, entre em contato com a equipe de desenvolvimento.

