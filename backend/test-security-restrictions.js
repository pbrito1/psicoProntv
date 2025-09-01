/**
 * Script de Teste para Verificar Restrições de Segurança
 * 
 * Este script testa se as regras de negócio estão funcionando:
 * - Terapeutas não podem ver dados de outros terapeutas
 * - Terapeutas só podem acessar seus próprios clientes
 * - Terapeutas só podem ver seus próprios prontuários e agendamentos
 */

const axios = require('axios');

// Configuração
const BASE_URL = 'http://localhost:3001';
const TEST_THERAPIST_1 = {
  email: 'terapeuta1@test.com',
  password: 'password123'
};

const TEST_THERAPIST_2 = {
  email: 'terapeuta2@test.com',
  password: 'password123'
};

let therapist1Token = '';
let therapist2Token = '';
let testClientId = null;

// Função para fazer login
async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data.access_token;
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
    return null;
  }
}

// Função para criar um cliente de teste
async function createTestClient(token) {
  try {
    const clientData = {
      name: 'Cliente Teste',
      email: 'cliente.teste@test.com',
      phone: '11999999999',
      birthDate: '2010-01-01',
      address: 'Rua Teste, 123',
      emergencyContact: 'Pai Teste',
      emergencyPhone: '11888888888',
      medicalHistory: 'Histórico de teste',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma'
    };

    const response = await axios.post(`${BASE_URL}/clients`, clientData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.id;
  } catch (error) {
    console.error('Erro ao criar cliente:', error.response?.data || error.message);
    return null;
  }
}

// Função para atribuir terapeuta ao cliente
async function assignTherapistToClient(token, clientId, therapistId, isPrimary = false) {
  try {
    const response = await axios.post(`${BASE_URL}/clients/${clientId}/therapists`, {
      therapistId,
      isPrimary
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao atribuir terapeuta:', error.response?.data || error.message);
    return null;
  }
}

// Função para tentar acessar dados de outro terapeuta
async function testUnauthorizedAccess(token, clientId) {
  console.log('\n🔒 Testando acesso não autorizado...');
  
  try {
    // Tentar ver detalhes do cliente
    const clientResponse = await axios.get(`${BASE_URL}/clients/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('❌ ERRO: Terapeuta conseguiu acessar cliente de outro terapeuta');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ SUCESSO: Acesso negado corretamente');
      return true;
    } else {
      console.log('❌ ERRO: Status inesperado:', error.response?.status);
      return false;
    }
  }
}

// Função para testar acesso autorizado
async function testAuthorizedAccess(token, clientId) {
  console.log('\n✅ Testando acesso autorizado...');
  
  try {
    const response = await axios.get(`${BASE_URL}/clients/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.id === clientId) {
      console.log('✅ SUCESSO: Terapeuta conseguiu acessar seu próprio cliente');
      return true;
    } else {
      console.log('❌ ERRO: Dados incorretos retornados');
      return false;
    }
  } catch (error) {
    console.log('❌ ERRO: Acesso negado incorretamente:', error.response?.data || error.message);
    return false;
  }
}

// Função principal de teste
async function runSecurityTests() {
  console.log('🚀 Iniciando testes de segurança...\n');

  // 1. Login dos terapeutas
  console.log('1️⃣ Fazendo login dos terapeutas...');
  therapist1Token = await login(TEST_THERAPIST_1);
  therapist2Token = await login(TEST_THERAPIST_2);

  if (!therapist1Token || !therapist2Token) {
    console.log('❌ Falha no login dos terapeutas. Abortando testes.');
    return;
  }

  console.log('✅ Login realizado com sucesso');

  // 2. Criar cliente de teste
  console.log('\n2️⃣ Criando cliente de teste...');
  testClientId = await createTestClient(therapist1Token);

  if (!testClientId) {
    console.log('❌ Falha ao criar cliente de teste. Abortando testes.');
    return;
  }

  console.log('✅ Cliente criado com ID:', testClientId);

  // 3. Atribuir terapeuta 1 ao cliente
  console.log('\n3️⃣ Atribuindo terapeuta 1 ao cliente...');
  const assignment = await assignTherapistToClient(therapist1Token, testClientId, 1, true);

  if (!assignment) {
    console.log('❌ Falha ao atribuir terapeuta. Abortando testes.');
    return;
  }

  console.log('✅ Terapeuta atribuído com sucesso');

  // 4. Testar acesso autorizado (terapeuta 1 acessando seu próprio cliente)
  const authorizedAccess = await testAuthorizedAccess(therapist1Token, testClientId);

  // 5. Testar acesso não autorizado (terapeuta 2 tentando acessar cliente do terapeuta 1)
  const unauthorizedAccess = await testUnauthorizedAccess(therapist2Token, testClientId);

  // 6. Resumo dos testes
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('========================');
  console.log(`✅ Acesso Autorizado: ${authorizedAccess ? 'PASSOU' : 'FALHOU'}`);
  console.log(`🔒 Acesso Não Autorizado: ${unauthorizedAccess ? 'PASSOU' : 'FALHOU'}`);

  if (authorizedAccess && unauthorizedAccess) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! As restrições de segurança estão funcionando.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique a implementação das restrições.');
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runSecurityTests().catch(console.error);
}

module.exports = { runSecurityTests };
