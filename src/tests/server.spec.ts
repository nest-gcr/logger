import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from './utils/test.module';

test('it should parse trace context', async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [TestModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  await app.init();

  return request(app.getHttpServer())
    .get('/test')
    .set('x-cloud-trace-context', '6cda33b93169889b07951175dedda929/18290773695573468387')
    .expect(200)
    .expect(res => {
      expect(res.body['x-cloud-trace-context']).toBe('6cda33b93169889b07951175dedda929/18290773695573468387');
      return true;
    });
});
