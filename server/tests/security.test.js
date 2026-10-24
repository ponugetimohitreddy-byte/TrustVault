const request = require('supertest');
const {
  setupApp,
  teardownApp,
  createUser,
  login,
  expiredToken,
  invalidToken,
} = require('./helpers');
const User = require('../src/models/User');
const AuditLog = require('../src/models/AuditLog');

let app;
let admin;
let alice;
let bob;
let carol;

beforeAll(async () => {
  app = await setupApp();
}, 30000);

afterAll(async () => {
  await teardownApp();
}, 30000);

beforeEach(async () => {
  await User.deleteMany({});
  await require('../src/models/Document').deleteMany({});
  await require('../src/models/DocumentPermission').deleteMany({});
  await require('../src/models/DocumentVersion').deleteMany({});
  await require('../src/models/AuditLog').deleteMany({});
  await require('../src/models/RefreshToken').deleteMany({});

  admin = await createUser({ name: 'Admin', email: 'admin@company.com', role: 'admin', employeeId: 'A1' });
  alice = await createUser({ name: 'Alice', email: 'alice@company.com', employeeId: 'E1' });
  bob = await createUser({ name: 'Bob', email: 'bob@company.com', employeeId: 'E2' });
  carol = await createUser({ name: 'Carol', email: 'carol@company.com', employeeId: 'E3' });
});

async function authHeader(user) {
  const res = await login(app, user.email);
  expect(res.status).toBe(200);
  return `Bearer ${res.body.accessToken}`;
}

async function uploadDoc(token, { title = 'Policy', visibility = 'private', filename = 'policy.txt' } = {}) {
  return request(app)
    .post('/api/documents')
    .set('Authorization', token)
    .field('title', title)
    .field('description', 'A controlled document')
    .field('visibility', visibility)
    .attach('file', Buffer.from('hello world file contents'), filename);
}

test('1. unauthenticated user cannot access protected endpoints', async () => {
  const res = await request(app).get('/api/documents');
  expect(res.status).toBe(401);
});

test('2. an employee can publish a document', async () => {
  const token = await authHeader(alice);
  const res = await uploadDoc(token, { title: 'Alice Policy' });
  expect(res.status).toBe(201);
  expect(res.body.document.publisherId).toBe(String(alice._id));
  expect(res.body.document.access.role).toBe('publisher');
});

test('3. an employee cannot access a private document without permission', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken, { visibility: 'private' });
  const bobToken = await authHeader(bob);
  const res = await request(app)
    .get(`/api/documents/${created.body.document.id}`)
    .set('Authorization', bobToken);
  expect(res.status).toBe(404);
});

test('4. a viewer can read an authorized document', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .send({ permission: 'viewer' })
    .expect(201);

  const bobToken = await authHeader(bob);
  const res = await request(app).get(`/api/documents/${id}`).set('Authorization', bobToken);
  expect(res.status).toBe(200);
  expect(res.body.document.access.role).toBe('viewer');
  expect(res.body.document.access.canEdit).toBe(false);
});

test('5. a viewer cannot edit a document', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .send({ permission: 'viewer' });

  const bobToken = await authHeader(bob);
  const res = await request(app)
    .patch(`/api/documents/${id}`)
    .set('Authorization', bobToken)
    .send({ title: 'Hacked' });
  expect(res.status).toBe(403);
});

test('6. an editor can read and edit an authorized document', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .send({ permission: 'editor' });

  const bobToken = await authHeader(bob);
  const read = await request(app).get(`/api/documents/${id}`).set('Authorization', bobToken);
  expect(read.status).toBe(200);
  const edit = await request(app)
    .patch(`/api/documents/${id}`)
    .set('Authorization', bobToken)
    .field('title', 'Updated by editor')
    .attach('file', Buffer.from('new contents'), 'policy-v2.txt');
  expect(edit.status).toBe(200);
  expect(edit.body.document.version).toBe(2);
  expect(edit.body.document.title).toBe('Updated by editor');
});

test('7. an editor cannot change permissions unless explicitly authorized', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .send({ permission: 'editor' });

  const bobToken = await authHeader(bob);
  const res = await request(app)
    .put(`/api/documents/${id}/permissions/${carol._id}`)
    .set('Authorization', bobToken)
    .send({ permission: 'viewer' });
  expect(res.status).toBe(403);
});

test('8. a publisher can grant and revoke access to their document', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .send({ permission: 'viewer' })
    .expect(201);
  await request(app)
    .delete(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .expect(200);
});

test('9. a revoked user is denied on the next access request', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken, { visibility: 'restricted' });
  const id = created.body.document.id;
  await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .send({ permission: 'viewer' });
  await request(app)
    .delete(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken);

  const bobToken = await authHeader(bob);
  const res = await request(app).get(`/api/documents/${id}`).set('Authorization', bobToken);
  expect(res.status).toBe(404);
});

test('10. an administrator can manage document visibility and permissions', async () => {
  const aliceToken = await authHeader(alice);
  const adminToken = await authHeader(admin);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  const vis = await request(app)
    .patch(`/api/documents/${id}/visibility`)
    .set('Authorization', adminToken)
    .send({ visibility: 'organization' });
  expect(vis.status).toBe(200);
  expect(vis.body.document.visibility).toBe('organization');
  const perm = await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', adminToken)
    .send({ permission: 'editor' });
  expect(perm.status).toBe(201);
});

test('11. an employee cannot access administrator-only endpoints', async () => {
  const token = await authHeader(alice);
  const users = await request(app).get('/api/users').set('Authorization', token);
  expect(users.status).toBe(403);
  const logs = await request(app).get('/api/audit-logs').set('Authorization', token);
  expect(logs.status).toBe(403);
});

test('12. changing a document ID in a URL does not bypass authorization', async () => {
  const aliceToken = await authHeader(alice);
  const bobToken = await authHeader(bob);
  const a = await uploadDoc(aliceToken, { title: 'Secret A' });
  const b = await uploadDoc(bobToken, { title: 'Secret B' });
  const res = await request(app)
    .get(`/api/documents/${a.body.document.id}`)
    .set('Authorization', bobToken);
  expect(res.status).toBe(404);
  const own = await request(app)
    .get(`/api/documents/${b.body.document.id}`)
    .set('Authorization', bobToken);
  expect(own.status).toBe(200);
});

test('13. a deactivated user cannot continue accessing protected resources', async () => {
  const aliceToken = await authHeader(alice);
  const adminToken = await authHeader(admin);
  await request(app)
    .patch(`/api/users/${alice._id}/status`)
    .set('Authorization', adminToken)
    .send({ isActive: false })
    .expect(200);
  const res = await request(app).get('/api/documents').set('Authorization', aliceToken);
  expect(res.status).toBe(401);
});

test('14. invalid and expired JWTs are rejected', async () => {
  const expired = expiredToken(alice);
  const invalid = invalidToken();
  const a = await request(app).get('/api/documents').set('Authorization', `Bearer ${expired}`);
  const b = await request(app).get('/api/documents').set('Authorization', `Bearer ${invalid}`);
  expect(a.status).toBe(401);
  expect(b.status).toBe(401);
});

test('15. a user cannot download a file they are not authorized to access', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken, { visibility: 'private' });
  const bobToken = await authHeader(bob);
  const res = await request(app)
    .get(`/api/documents/${created.body.document.id}/download`)
    .set('Authorization', bobToken);
  expect(res.status).toBe(404);
});

test('16. unauthorized users cannot access document version history', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const bobToken = await authHeader(bob);
  const res = await request(app)
    .get(`/api/documents/${created.body.document.id}/versions`)
    .set('Authorization', bobToken);
  expect(res.status).toBe(404);
});

test('17. audit logs record successful permission changes and sensitive actions', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  await request(app)
    .put(`/api/documents/${id}/permissions/${bob._id}`)
    .set('Authorization', aliceToken)
    .send({ permission: 'editor' });
  const grant = await AuditLog.findOne({ action: 'permission.grant', documentId: id });
  const upload = await AuditLog.findOne({ action: 'document.upload', documentId: id });
  expect(grant).toBeTruthy();
  expect(upload).toBeTruthy();
});

test('organization-wide visibility allows viewing but not editing', async () => {
  const aliceToken = await authHeader(alice);
  const adminToken = await authHeader(admin);
  const created = await uploadDoc(aliceToken);
  const id = created.body.document.id;
  await request(app)
    .patch(`/api/documents/${id}/visibility`)
    .set('Authorization', adminToken)
    .send({ visibility: 'organization' });
  const bobToken = await authHeader(bob);
  const view = await request(app).get(`/api/documents/${id}`).set('Authorization', bobToken);
  expect(view.status).toBe(200);
  const edit = await request(app)
    .patch(`/api/documents/${id}`)
    .set('Authorization', bobToken)
    .send({ title: 'Nope' });
  expect(edit.status).toBe(403);
});

test('publisher cannot set organization-wide visibility', async () => {
  const aliceToken = await authHeader(alice);
  const created = await uploadDoc(aliceToken);
  const res = await request(app)
    .patch(`/api/documents/${created.body.document.id}/visibility`)
    .set('Authorization', aliceToken)
    .send({ visibility: 'organization' });
  expect(res.status).toBe(403);
});

test('list endpoints hide unauthorized private documents', async () => {
  const aliceToken = await authHeader(alice);
  await uploadDoc(aliceToken, { title: 'Hidden' });
  const bobToken = await authHeader(bob);
  const res = await request(app).get('/api/documents').set('Authorization', bobToken);
  expect(res.status).toBe(200);
  expect(res.body.items.find((d) => d.title === 'Hidden')).toBeUndefined();
});
