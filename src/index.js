import { DurableObject } from 'cloudflare:workers';
import { survey } from '../survey.config.js';

const participantPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

export class SurveyRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS votes (participant TEXT PRIMARY KEY, choice TEXT NOT NULL)');
  }

  snapshot(participant) {
    const rows = this.ctx.storage.sql.exec('SELECT choice, COUNT(*) AS count FROM votes GROUP BY choice').toArray();
    const counts = new Map(rows.map(row => [row.choice, Number(row.count)]));
    const myChoice = this.ctx.storage.sql.exec('SELECT choice FROM votes WHERE participant = ?', participant).toArray()[0]?.choice ?? null;
    const options = survey.options.map(option => ({ ...option, count: counts.get(option.id) ?? 0 }));
    return {
      id: survey.id,
      question: survey.question,
      description: survey.description,
      options,
      total: options.reduce((sum, option) => sum + option.count, 0),
      myChoice,
    };
  }

  recordVote(participant, choice) {
    this.ctx.storage.sql.exec(
      'INSERT INTO votes (participant, choice) VALUES (?, ?) ON CONFLICT(participant) DO UPDATE SET choice = excluded.choice',
      participant,
      choice,
    );
    return this.snapshot(participant);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/survey' && request.method === 'GET') {
      const participant = url.searchParams.get('participant');
      if (!participantPattern.test(participant ?? '')) return json({ error: '응답자 정보가 올바르지 않습니다.' }, 400);
      return json(await env.SURVEY.getByName(survey.id).snapshot(participant));
    }

    if (url.pathname === '/api/vote' && request.method === 'POST') {
      if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) {
        return json({ error: '허용되지 않은 요청입니다.' }, 403);
      }
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
        return json({ error: '요청 형식이 올바르지 않습니다.' }, 415);
      }
      const raw = await request.text();
      if (raw.length > 1024) return json({ error: '요청이 너무 큽니다.' }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ error: '요청 내용을 읽을 수 없습니다.' }, 400); }
      if (!participantPattern.test(body?.participant ?? '') || !survey.options.some(option => option.id === body?.choice)) {
        return json({ error: '응답을 다시 확인해 주세요.' }, 400);
      }
      return json(await env.SURVEY.getByName(survey.id).recordVote(body.participant, body.choice));
    }

    return json({ error: '요청한 주소를 찾을 수 없습니다.' }, 404);
  },
};
