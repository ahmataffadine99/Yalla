const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const {
  ACCESS_TOKEN_TTL_SECONDS,
  createAccessToken,
  verifyAccessToken,
} = require('../dist/modules/auth/access-token');
const { AuthService } = require('../dist/modules/auth/auth.service');
const { RegisterDto } = require('../dist/modules/auth/register.dto');

const secret = 'test-secret-with-at-least-32-characters';
const config = {
  getOrThrow(key) {
    return {
      AUTH_TOKEN_SECRET: secret,
      CLIENT_WEB_ORIGIN: 'http://localhost:3002',
    }[key];
  },
};

class InMemoryUserRepository {
  users = [];

  create(user) {
    return user;
  }

  async findOne({ where }) {
    const conditions = Array.isArray(where) ? where : [where];
    return (
      this.users.find((user) =>
        conditions.some((condition) =>
          Object.entries(condition).every(
            ([key, value]) => user[key] === value,
          ),
        ),
      ) ?? null
    );
  }

  async findOneBy(condition) {
    return (
      this.users.find((user) =>
        Object.entries(condition).every(([key, value]) => user[key] === value),
      ) ?? null
    );
  }

  async save(user) {
    const index = this.users.findIndex((item) => item.id === user.id);
    if (index === -1) {
      this.users.push(user);
    } else {
      this.users[index] = user;
    }
    return user;
  }

  async update(condition, changes) {
    const user = this.users.find((item) =>
      Object.entries(condition).every(
        ([key, value]) => item[key] === value,
      ),
    );
    if (!user) {
      return { affected: 0 };
    }
    Object.assign(user, changes);
    return { affected: 1 };
  }
}

function createAuthService() {
  const users = new InMemoryUserRepository();
  const sentEmails = [];
  const email = {
    assertConfigured() {},
    async sendVerificationLink(address, link) {
      sentEmails.push({ address, link });
    },
  };

  return {
    auth: new AuthService(users, email, config),
    users,
    sentEmails,
  };
}

test('registers an unverified user and emails a single-use confirmation link', async () => {
  const { auth, users, sentEmails } = createAuthService();

  const result = await auth.register({
    email: ' Rider@Example.com ',
    phoneNumber: '+33612345678',
    password: 'correct horse battery',
  });

  assert.equal(users.users.length, 1);
  assert.equal(users.users[0].email, 'rider@example.com');
  assert.equal(users.users[0].phoneNumber, '+33612345678');
  assert.notEqual(users.users[0].passwordHash, 'correct horse battery');
  assert.equal(users.users[0].emailVerifiedAt, null);
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].address, 'rider@example.com');
  assert.equal(
    new URL(sentEmails[0].link).origin,
    'http://localhost:3002',
  );
  assert.deepEqual(result, {
    message:
      'Si ces informations permettent une inscription, un lien de confirmation sera envoyé par e-mail.',
  });
});

test('does not persist an account when email delivery is not configured', async () => {
  const users = new InMemoryUserRepository();
  const email = {
    assertConfigured() {
      const error = new Error('Email delivery is not configured');
      error.getStatus = () => 503;
      throw error;
    },
  };
  const auth = new AuthService(users, email, config);

  await assert.rejects(
    auth.register({
      email: 'rider@example.com',
      phoneNumber: '+33612345678',
      password: 'correct horse battery',
    }),
    (error) => error.getStatus() === 503,
  );
  assert.equal(users.users.length, 0);
});

test('confirms email once and allows login only after confirmation', async () => {
  const { auth, users, sentEmails } = createAuthService();
  await auth.register({
    email: 'rider@example.com',
    phoneNumber: '+23566123456',
    password: 'correct horse battery',
  });
  const token = new URL(sentEmails[0].link).searchParams.get('token');

  assert.deepEqual(await auth.verifyEmail(token), { emailVerified: true });
  await assert.rejects(
    auth.verifyEmail(token),
    (error) => error.getStatus() === 409,
  );

  const session = await auth.login({
    email: 'RIDER@example.com',
    password: 'correct horse battery',
  });
  assert.equal(session.tokenType, 'Bearer');
  assert.equal(session.expiresIn, ACCESS_TOKEN_TTL_SECONDS);
  assert.deepEqual(session.user, {
    id: users.users[0].id,
    email: 'rider@example.com',
    phoneNumber: '+23566123456',
  });
  assert.deepEqual(
    verifyAccessToken(session.accessToken, secret)?.email,
    'rider@example.com',
  );
  assert.deepEqual(await auth.getProfile(users.users[0].id), {
    id: users.users[0].id,
    email: 'rider@example.com',
    phoneNumber: '+23566123456',
    emailVerified: true,
  });
});

test('allows a confirmation link to be consumed only once under concurrent requests', async () => {
  const { auth, sentEmails } = createAuthService();
  await auth.register({
    email: 'rider@example.com',
    phoneNumber: '+23566123456',
    password: 'correct horse battery',
  });
  const token = new URL(sentEmails[0].link).searchParams.get('token');

  const results = await Promise.allSettled([
    auth.verifyEmail(token),
    auth.verifyEmail(token),
  ]);

  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected').length, 1);
});

test('does not allow login before email confirmation or with a wrong password', async () => {
  const { auth } = createAuthService();
  await auth.register({
    email: 'rider@example.com',
    phoneNumber: '+33612345678',
    password: 'correct horse battery',
  });

  await assert.rejects(
    auth.login({ email: 'rider@example.com', password: 'correct horse battery' }),
    (error) => error.getStatus() === 401,
  );
});

test('resends a fresh confirmation link and invalidates the previous link', async () => {
  const { auth, sentEmails } = createAuthService();
  await auth.register({
    email: 'rider@example.com',
    phoneNumber: '+33612345678',
    password: 'correct horse battery',
  });
  const oldToken = new URL(sentEmails[0].link).searchParams.get('token');

  await auth.resendVerification('RIDER@example.com');
  const newToken = new URL(sentEmails[1].link).searchParams.get('token');

  assert.notEqual(oldToken, newToken);
  await assert.rejects(
    auth.verifyEmail(oldToken),
    (error) => error.getStatus() === 409,
  );
  assert.deepEqual(await auth.verifyEmail(newToken), { emailVerified: true });
});

test('rejects expired email verification links', async () => {
  const { auth, users, sentEmails } = createAuthService();
  await auth.register({
    email: 'rider@example.com',
    phoneNumber: '+33612345678',
    password: 'correct horse battery',
  });
  users.users[0].emailVerificationExpiresAt = new Date(Date.now() - 1);
  const token = new URL(sentEmails[0].link).searchParams.get('token');

  await assert.rejects(
    auth.verifyEmail(token),
    (error) => error.getStatus() === 409,
  );
});

test('does not issue tokens with an invalid signature or expired claims', () => {
  const token = createAccessToken(
    { id: 'user-id', email: 'rider@example.com' },
    secret,
    100,
  );
  assert.equal(verifyAccessToken(token, 'another-secret', 101), null);
  assert.equal(
    verifyAccessToken(token, secret, 100 + ACCESS_TOKEN_TTL_SECONDS),
    null,
  );
});

test('requires an international phone number and a long password at registration', async () => {
  const valid = plainToInstance(RegisterDto, {
    email: 'rider@example.com',
    phoneNumber: '+23566123456',
    password: 'correct horse battery',
  });
  const invalid = plainToInstance(RegisterDto, {
    email: 'not-an-email',
    phoneNumber: '066123456',
    password: 'short',
  });

  assert.deepEqual(await validate(valid), []);
  assert.ok((await validate(invalid)).length >= 3);
});
