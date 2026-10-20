const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const {
  PhoneVerificationService,
} = require('../dist/modules/auth/phone-verification.service');
const {
  PhoneVerificationDto,
} = require('../dist/modules/auth/phone-verification.dto');
const {
  CheckPhoneVerificationDto,
} = require('../dist/modules/auth/check-phone-verification.dto');

const credentials = {
  TWILIO_ACCOUNT_SID: 'AC' + 'a'.repeat(32),
  TWILIO_AUTH_TOKEN: 'local-test-token',
  TWILIO_VERIFY_SERVICE_SID: 'VA' + 'b'.repeat(32),
};

function createService(values = credentials) {
  return new PhoneVerificationService({
    get(key) {
      return values[key];
    },
  });
}

async function withMockedFetch(mock, run) {
  const originalFetch = global.fetch;
  global.fetch = mock;

  try {
    await run();
  } finally {
    global.fetch = originalFetch;
  }
}

test('starts an SMS verification through Twilio Verify', async () => {
  await withMockedFetch(async (input, options) => {
    assert.equal(
      input,
      `https://verify.twilio.com/v2/Services/${credentials.TWILIO_VERIFY_SERVICE_SID}/Verifications`,
    );
    assert.equal(options.method, 'POST');
    assert.equal(
      options.headers.Authorization,
      `Basic ${Buffer.from(
        `${credentials.TWILIO_ACCOUNT_SID}:${credentials.TWILIO_AUTH_TOKEN}`,
      ).toString('base64')}`,
    );
    assert.equal(
      options.body.toString(),
      'To=%2B33612345678&Channel=sms',
    );

    return Response.json({ status: 'pending' });
  }, async () => {
    assert.deepEqual(
      await createService().start('+33612345678'),
      { status: 'pending' },
    );
  });
});

test('accepts only a Twilio-approved verification code', async () => {
  await withMockedFetch(async (input, options) => {
    assert.ok(input.endsWith('/VerificationCheck'));
    assert.equal(
      options.body.toString(),
      'To=%2B33612345678&Code=123456',
    );
    return Response.json({ status: 'approved' });
  }, async () => {
    assert.deepEqual(
      await createService().check('+33612345678', '123456'),
      {
        phoneNumberVerified: true,
        phoneNumber: '+33612345678',
      },
    );
  });
});

test('rejects an invalid Twilio code without marking the phone verified', async () => {
  await withMockedFetch(async () => Response.json({ status: 'pending' }), async () => {
    await assert.rejects(
      createService().check('+33612345678', '123456'),
      (error) => error.getStatus() === 400,
    );
  });
});

test('fails explicitly when Twilio credentials are not configured', async () => {
  await assert.rejects(
    createService({}).start('+33612345678'),
    (error) => error.getStatus() === 503,
  );
});

test('reports Twilio network failures without hiding the error as success', async () => {
  await withMockedFetch(async () => {
    throw new TypeError('network error');
  }, async () => {
    await assert.rejects(
      createService().start('+33612345678'),
      (error) => error.getStatus() === 503,
    );
  });
});

test('validates international phone numbers in E.164 format', async () => {
  const valid = plainToInstance(PhoneVerificationDto, {
    phoneNumber: '+33612345678',
  });
  const invalid = plainToInstance(PhoneVerificationDto, {
    phoneNumber: '06 12 34 56 78',
  });

  assert.deepEqual(await validate(valid), []);
  assert.ok((await validate(invalid)).length > 0);
});

test('requires a six-digit verification code', async () => {
  const valid = plainToInstance(CheckPhoneVerificationDto, {
    phoneNumber: '+23566123456',
    code: '123456',
  });
  const invalid = plainToInstance(CheckPhoneVerificationDto, {
    phoneNumber: '+23566123456',
    code: '12AB',
  });

  assert.deepEqual(await validate(valid), []);
  assert.ok((await validate(invalid)).length > 0);
});
