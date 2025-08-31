# API de Clientes

Esta documentação descreve os endpoints disponíveis para gerenciamento de clientes no sistema.

## Autenticação

Todos os endpoints requerem autenticação JWT. Inclua o token no header:
```
Authorization: Bearer <seu_token_jwt>
```

## Endpoints

### 1. Criar Cliente
- **POST** `/clients`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Cria um novo cliente no sistema

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "birthDate": "1990-01-01",
  "address": "Rua das Flores, 123",
  "emergencyContact": "Maria Silva",
  "emergencyPhone": "(11) 88888-8888",
  "medicalHistory": "Histórico médico do paciente",
  "currentMedications": "Medicamentos em uso",
  "allergies": "Alergias conhecidas"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "address": "Rua das Flores, 123",
  "emergencyContact": "Maria Silva",
  "emergencyPhone": "(11) 88888-8888",
  "medicalHistory": "Histórico médico do paciente",
  "currentMedications": "Medicamentos em uso",
  "allergies": "Alergias conhecidas",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Listar Todos os Clientes
- **GET** `/clients`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna lista de todos os clientes ordenados por nome

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "address": "Rua das Flores, 123",
    "emergencyContact": "Maria Silva",
    "emergencyPhone": "(11) 88888-8888",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Buscar Cliente por ID
- **GET** `/clients/:id`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna dados completos do cliente incluindo agendamentos e prontuários

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "address": "Rua das Flores, 123",
  "emergencyContact": "Maria Silva",
  "emergencyPhone": "(11) 88888-8888",
  "bookings": [...],
  "medicalRecords": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Buscar Cliente por Email
- **GET** `/clients/email/:email`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Busca cliente pelo endereço de email

### 5. Buscar Clientes
- **GET** `/clients/search?q=termo`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Busca clientes por nome, email ou telefone
- **Query Params**: `q` - termo de busca (mínimo 2 caracteres)

### 6. Estatísticas do Cliente
- **GET** `/clients/:id/stats`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Retorna estatísticas do cliente (total de agendamentos, sessões, etc.)

**Resposta de Sucesso (200):**
```json
{
  "client": { ... },
  "stats": {
    "totalBookings": 5,
    "completedBookings": 3,
    "totalSessions": 3,
    "lastSession": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Atualizar Cliente
- **PATCH** `/clients/:id`
- **Permissão**: ADMIN, THERAPIST
- **Descrição**: Atualiza dados do cliente

**Body:** (campos opcionais)
```json
{
  "name": "João Silva Santos",
  "phone": "(11) 77777-7777"
}
```

### 8. Excluir Cliente
- **DELETE** `/clients/:id`
- **Permissão**: ADMIN
- **Descrição**: Exclui cliente (apenas se não tiver agendamentos ativos)

## Validações

- **Email**: Deve ser único no sistema
- **Data de Nascimento**: Deve ser uma data válida
- **Campos Obrigatórios**: name, email, phone, birthDate, address, emergencyContact, emergencyPhone
- **Campos Opcionais**: medicalHistory, currentMedications, allergies

## Regras de Negócio

1. **Exclusão**: Cliente só pode ser excluído se não tiver agendamentos ativos (PENDING ou CONFIRMED)
2. **Email Único**: Não é possível ter dois clientes com o mesmo email
3. **Busca**: Busca por nome, email ou telefone (mínimo 2 caracteres)
4. **Permissões**: 
   - ADMIN: Acesso total
   - THERAPIST: Pode criar, visualizar e atualizar clientes
   - USER: Sem acesso

## Códigos de Erro

- **400**: Dados inválidos, email já existe, não é possível excluir
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Cliente não encontrado
- **500**: Erro interno do servidor

## Exemplos de Uso

### Criar Cliente
```bash
curl -X POST http://localhost:3000/clients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone": "(11) 99999-8888",
    "birthDate": "1985-05-15",
    "address": "Av. Paulista, 1000",
    "emergencyContact": "João Santos",
    "emergencyPhone": "(11) 88888-9999"
  }'
```

### Buscar Cliente
```bash
curl -X GET http://localhost:3000/clients/1 \
  -H "Authorization: Bearer <token>"
```

### Atualizar Cliente
```bash
curl -X PATCH http://localhost:3000/clients/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "(11) 77777-7777"
  }'
```
