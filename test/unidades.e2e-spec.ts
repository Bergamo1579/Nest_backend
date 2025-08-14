import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import readlineSync from 'readline-sync';

describe('Unidades (e2e)', () => {
  let app: INestApplication;
  let unidadeId: string;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Solicita credenciais no terminal
    const username = process.env.TEST_USER || 'usuario123';
    const password = process.env.TEST_PASS || 'senhaSegura123';

    // Faz login e pega o token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password });

    expect(loginRes.status).toBe(201);
    token = loginRes.body.access_token;

    // Decodifica o token para mostrar o nível de elevação
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Payload JWT:', payload);

    // Cria uma unidade para os testes
    const dto = { nome: 'Unidade para testes', localizacao: 'Teste' };
    const createRes = await request(app.getHttpServer())
      .post('/unidades')
      .set('Authorization', `Bearer ${token}`)
      .send(dto);
    unidadeId = createRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/unidades (GET) deve retornar todas as unidades', async () => {
    const res = await request(app.getHttpServer())
      .get('/unidades')
      .set('Authorization', `Bearer ${token}`);

    if (res.status === 200) {
      console.log('Usuário possui elevação suficiente para acessar /unidades');
    } else if (res.status === 403) {
      console.warn('Usuário NÃO possui elevação suficiente para acessar /unidades');
    } else {
      console.warn('Resposta inesperada ao testar elevação:', res.status);
    }

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(u => u.id === unidadeId)).toBe(true);
  });

  it('/unidades/:id (GET) deve retornar a unidade criada', async () => {
    const res = await request(app.getHttpServer())
      .get(`/unidades/${unidadeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(unidadeId);
    expect(res.body.nome).toBe('Unidade para testes');
  });

  it('/unidades/:id (PUT) deve atualizar a unidade', async () => {
    const updateDto = { nome: 'Unidade Atualizada', localizacao: 'Novo Bairro' };
    const res = await request(app.getHttpServer())
      .put(`/unidades/${unidadeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateDto);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe(updateDto.nome);
    expect(res.body.localizacao).toBe(updateDto.localizacao);
  });

  it('/unidades/:id (DELETE) deve deletar a unidade', async () => {
    const deleteRes = await request(app.getHttpServer())
      .delete(`/unidades/${unidadeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app.getHttpServer())
      .get(`/unidades/${unidadeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });
});
