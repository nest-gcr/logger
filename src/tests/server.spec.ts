import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TestModule } from './utils/test.module';

const getApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [TestModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  await app.init();

  return app;
};

test('it should parse trace context', async () => {
  const app = await getApp();

  return request(app.getHttpServer())
    .get('/test')
    .set('x-cloud-trace-context', '6cda33b93169889b07951175dedda929/18290773695573468387')
    .expect(200)
    .expect(res => {
      expect(res.body['x-cloud-trace-context']).toBe('6cda33b93169889b07951175dedda929/18290773695573468387');
      return true;
    });
});

test('it should parse special trace context', async () => {
  const app = await getApp();
  return request(app.getHttpServer())
    .get('/test')
    .set('x-cloud-trace-context', 'b570bbf54330b0290eab4c586b94aa09/15119550131134270270;o=1')
    .expect(200)
    .expect(res => {
      expect(res.body['x-cloud-trace-context']).toBe('b570bbf54330b0290eab4c586b94aa09/15119550131134270270;o=1');
      return true;
    });
});
