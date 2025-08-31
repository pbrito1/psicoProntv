# API de Prontuários Médicos

Esta documentação descreve os endpoints disponíveis para gerenciamento de prontuários médicos no sistema.

## Autenticação

Todos os endpoints requerem autenticação JWT. Inclua o token no header:
```
Authorization: Bearer <seu_token_jwt>
```

## Endpoints

### 1. Criar Prontuário
- **POST** `/medical-records`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Cria um novo prontuário médico

**Body:**
```json
{
  "clientId": 1,
  "therapistId": 1,
  "sessionDate": "2024-01-01T10:00:00.000Z",
  "sessionType": "INDIVIDUAL",
  "sessionDuration": 60,
  "subjective": "Paciente relata ansiedade e insônia",
  "objective": "Paciente apresenta sinais de estresse",
  "assessment": "Transtorno de ansiedade leve",
  "plan": "Terapia cognitivo-comportamental",
  "notes": "Observações adicionais",
  "nextSessionDate": "2024-01-08T10:00:00.000Z",
  "bookingId": 1
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "clientId": 1,
  "therapistId": 1,
  "sessionDate": "2024-01-01T10:00:00.000Z",
  "sessionType": "INDIVIDUAL",
  "sessionDuration": 60,
  "subjective": "Paciente relata ansiedade e insônia",
  "objective": "Paciente apresenta sinais de estresse",
  "assessment": "Transtorno de ansiedade leve",
  "plan": "Terapia cognitivo-comportamental",
  "notes": "Observações adicionais",
  "nextSessionDate": "2024-01-08T10:00:00.000Z",
  "bookingId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "client": { ... },
  "therapist": { ... },
  "booking": { ... }
}
```

### 2. Listar Todos os Prontuários
- **GET** `/medical-records`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna lista de todos os prontuários ordenados por data

### 3. Buscar Prontuário por ID
- **GET** `/medical-records/:id`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna dados completos do prontuário

### 4. Buscar Prontuários por Cliente
- **GET** `/medical-records/client/:clientId`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna todos os prontuários de um cliente específico

### 5. Buscar Prontuários por Terapeuta
- **GET** `/medical-records/therapist/:therapistId`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna todos os prontuários de um terapeuta específico

### 6. Buscar Prontuário por Agendamento
- **GET** `/medical-records/booking/:bookingId`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Busca prontuário relacionado a um agendamento específico

### 7. Progresso do Cliente
- **GET** `/medical-records/client/:clientId/progress`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna estatísticas de progresso do cliente

**Resposta de Sucesso (200):**
```json
{
  "totalSessions": 5,
  "progress": [...],
  "lastSession": "2024-01-01T10:00:00.000Z",
  "nextSession": "2024-01-08T10:00:00.000Z"
}
```

### 8. Estatísticas do Terapeuta
- **GET** `/medical-records/therapist/:therapistId/stats`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna estatísticas do terapeuta

**Resposta de Sucesso (200):**
```json
{
  "totalRecords": 25,
  "recordsThisMonth": 8,
  "averageSessionDuration": 55.2
}
```

### 9. Buscar Prontuários
- **GET** `/medical-records/search?q=termo`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Busca prontuários por conteúdo (SOAP, nomes, etc.)
- **Query Params**: `q` - termo de busca (mínimo 2 caracteres)

### 10. Atualizar Prontuário
- **PATCH** `/medical-records/:id`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Atualiza dados do prontuário

### 11. Excluir Prontuário
- **DELETE** `/medical-records/:id`
- **Permissão**: ADMIN
- **Descrição**: Exclui prontuário

## Estrutura SOAP

O sistema utiliza a metodologia SOAP para documentação clínica:

- **S (Subjective)**: Queixa principal do paciente
- **O (Objective)**: Observações objetivas do terapeuta
- **A (Assessment)**: Avaliação e diagnóstico
- **P (Plan)**: Plano terapêutico

## Tipos de Sessão

- **INDIVIDUAL**: Sessão individual
- **GROUP**: Sessão em grupo
- **FAMILY**: Sessão familiar

## Validações

- **Cliente**: Deve existir no sistema
- **Terapeuta**: Deve existir e ter role THERAPIST ou ADMIN
- **Data da Sessão**: Deve ser uma data válida
- **Agendamento**: Se fornecido, deve existir e não ter prontuário
- **Campos Obrigatórios**: clientId, therapistId, sessionDate, sessionDuration, subjective, objective, assessment, plan
- **Campos Opcionais**: notes, nextSessionDate, bookingId

## Regras de Negócio

1. **Terapeuta Padrão**: Se não for fornecido therapistId, usa o usuário logado
2. **Agendamento Único**: Cada agendamento pode ter apenas um prontuário
3. **Busca Inteligente**: Busca por conteúdo SOAP, nomes de clientes e terapeutas
4. **Progresso**: Rastreia evolução do cliente ao longo das sessões
5. **Estatísticas**: Fornece métricas para terapeutas e administradores

## Permissões

- **ADMIN**: Acesso total a todos os endpoints
- **THERAPIST**: Pode criar, visualizar e atualizar prontuários
- **USER**: Sem acesso

## Códigos de Erro

- **400**: Dados inválidos, conflitos, entidades não encontradas
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Prontuário não encontrado
- **500**: Erro interno do servidor

## Exemplos de Uso

### Criar Prontuário
```bash
curl -X POST http://localhost:3000/medical-records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "sessionDate": "2024-01-01T10:00:00.000Z",
    "sessionType": "INDIVIDUAL",
    "sessionDuration": 60,
    "subjective": "Ansiedade e insônia",
    "objective": "Sinais de estresse",
    "assessment": "Transtorno de ansiedade",
    "plan": "TCC"
  }'
```

### Buscar Progresso do Cliente
```bash
curl -X GET http://localhost:3000/medical-records/client/1/progress \
  -H "Authorization: Bearer <token>"
```

### Buscar por Conteúdo
```bash
curl -X GET "http://localhost:3000/medical-records/search?q=ansiedade" \
  -H "Authorization: Bearer <token>"
```

## Relacionamentos

- **Cliente**: Relacionamento obrigatório (1:N)
- **Terapeuta**: Relacionamento obrigatório (1:N)
- **Agendamento**: Relacionamento opcional (1:1)
- **Prontuário**: Pode existir independentemente de agendamento

## Funcionalidades Avançadas

- **Busca Semântica**: Busca por conteúdo clínico
- **Progresso Temporal**: Rastreamento da evolução do paciente
- **Estatísticas**: Métricas para gestão clínica
- **Integração**: Vinculação com agendamentos e clientes
