import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Unidades (e2e)', () => {
  let app: INestApplication;
  let unidadeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Cria uma unidade para os testes
    const dto = { nome: 'Unidade para testes', localizacao: 'Teste' };
    const createRes = await request(app.getHttpServer())
      .post('/unidades')
      .send(dto);
    unidadeId = createRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/unidades (GET) deve retornar todas as unidades', async () => {
    const res = await request(app.getHttpServer()).get('/unidades');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(u => u.id === unidadeId)).toBe(true);
  });

  it('/unidades/:id (GET) deve retornar a unidade criada', async () => {
    const res = await request(app.getHttpServer()).get(`/unidades/${unidadeId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(unidadeId);
    expect(res.body.nome).toBe('Unidade para testes');
  });

  it('/unidades/:id (PUT) deve atualizar a unidade', async () => {
    const updateDto = { nome: 'Unidade Atualizada', localizacao: 'Novo Bairro' };
    const res = await request(app.getHttpServer())
      .put(`/unidades/${unidadeId}`)
      .send(updateDto);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe(updateDto.nome);
    expect(res.body.localizacao).toBe(updateDto.localizacao);
  });

  it('/unidades/:id (DELETE) deve deletar a unidade', async () => {
    const deleteRes = await request(app.getHttpServer())
      .delete(`/unidades/${unidadeId}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app.getHttpServer())
      .get(`/unidades/${unidadeId}`);
    expect(getRes.status).toBe(404);
  });
});
