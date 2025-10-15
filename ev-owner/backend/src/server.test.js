import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './web/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);

let server;

beforeAll(async () => {
  server = app.listen(0);
});

afterAll(async () => {
  server.close();
});

describe('Auth', () => {
  it('rejects login without body', async () => {
    const res = await request(server).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});
