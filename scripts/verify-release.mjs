import { spawn } from 'node:child_process';

const apiUrl = 'http://localhost:3000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApi() {
  for (let index = 0; index < 40; index += 1) {
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // ignore during startup
    }

    await sleep(500);
  }

  throw new Error('API did not become ready in time.');
}

async function getJson(path, init) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}`);
  }

  return response.json();
}

function startApi() {
  return spawn('pnpm', ['--filter', '@supership/api', 'start'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: {
      ...process.env,
      PORT: '3000',
    },
  });
}

async function main() {
  console.log('Building workspace for release verification...');
  const build = spawn('pnpm', ['build'], { stdio: 'inherit', shell: true });
  const buildCode = await new Promise((resolve) => build.on('exit', resolve));
  if (buildCode !== 0) {
    throw new Error(`Build failed with code ${buildCode}`);
  }

  console.log('Starting API for release verification...');
  const api = startApi();
  let apiStdout = '';
  let apiStderr = '';
  api.stdout.on('data', (chunk) => {
    apiStdout += chunk.toString();
    process.stdout.write(chunk);
  });
  api.stderr.on('data', (chunk) => {
    apiStderr += chunk.toString();
    process.stderr.write(chunk);
  });

  try {
    await waitForApi();

    console.log('Running end-to-end release verification checks...');
    const health = await getJson('/api/health');
    const documents = await getJson('/api/documents');
    const meta = await getJson('/api/meta/document-types');
    const findings = await getJson('/api/documents/doc-program-alpha/findings');
    const trace = await getJson('/api/documents/doc-program-alpha/trace');
    const chat = await getJson('/api/documents/doc-program-alpha/chat');
    const createdDocument = await getJson('/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        type: 'wiki',
        title: 'Release verification document',
        summary: 'Created by the automated release verifier.',
        content: 'This document proves the release verification path works end to end.',
        status: 'active',
        ownerId: 'person-release-bot',
        tags: ['release', 'verification'],
      }),
    });
    const updatedDocument = await getJson(`/api/documents/${createdDocument.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'archived',
        summary: 'Release verification updated this document successfully.',
      }),
    });
    const parityChat = await getJson('/api/documents/doc-program-alpha/chat', {
      method: 'POST',
      body: JSON.stringify({
        content: 'What should this release candidate monitor first?',
      }),
    });

    const summary = {
      healthStatus: health.status,
      documentCount: documents.total,
      documentTypes: meta.documentTypes.length,
      findingsForProgramAlpha: findings.total,
      traceEventsForProgramAlpha: trace.total,
      seededChatMessagesForProgramAlpha: chat.total,
      createdDocumentId: createdDocument.id,
      updatedDocumentStatus: updatedDocument.status,
      parityChatMessagesCreated: parityChat.total,
    };

    if (summary.healthStatus !== 'ok') {
      throw new Error('Health check did not report ok status.');
    }
    if (summary.documentCount < 3) {
      throw new Error('Document count was lower than expected.');
    }
    if (summary.findingsForProgramAlpha < 1 || summary.traceEventsForProgramAlpha < 1) {
      throw new Error('Parity endpoints returned incomplete data.');
    }
    if (summary.updatedDocumentStatus !== 'archived') {
      throw new Error('Document update verification failed.');
    }
    if (summary.parityChatMessagesCreated !== 2) {
      throw new Error('Parity chat creation did not return the expected two-message exchange.');
    }

    console.log('Release verification summary:');
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    api.kill();
    await sleep(500);
    if (api.exitCode && api.exitCode !== 0) {
      console.error(apiStdout);
      console.error(apiStderr);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
