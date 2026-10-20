import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TWILIO_VERIFY_URL = 'https://verify.twilio.com/v2/Services';
const TWILIO_TIMEOUT_MS = 10000;

@Injectable()
export class PhoneVerificationService {
  constructor(private readonly config: ConfigService) {}

  async start(
    phoneNumber: string,
  ): Promise<{ status: 'pending' }> {
    const verification = await this.request('Verifications', {
      To: phoneNumber,
      Channel: 'sms',
    });

    if (verification.status !== 'pending') {
      throw new BadGatewayException(
        'Twilio Verify did not start the phone verification',
      );
    }

    return { status: 'pending' };
  }

  async check(
    phoneNumber: string,
    code: string,
  ): Promise<{ phoneNumberVerified: true; phoneNumber: string }> {
    const verification = await this.request('VerificationCheck', {
      To: phoneNumber,
      Code: code,
    });

    if (verification.status !== 'approved') {
      throw new BadRequestException('The code is invalid or has expired');
    }

    return { phoneNumberVerified: true, phoneNumber };
  }

  private async request(
    resource: 'Verifications' | 'VerificationCheck',
    parameters: Record<string, string>,
  ): Promise<Record<string, unknown>> {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const serviceSid = this.config.get<string>('TWILIO_VERIFY_SERVICE_SID');

    if (!accountSid || !authToken || !serviceSid) {
      throw new ServiceUnavailableException(
        'Phone verification is not configured',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TWILIO_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(
        `${TWILIO_VERIFY_URL}/${encodeURIComponent(serviceSid)}/${resource}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${accountSid}:${authToken}`,
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(parameters),
          signal: controller.signal,
        },
      );
    } catch (error) {
      if (
        error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        throw new ServiceUnavailableException(
          'Phone verification provider request failed',
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if (resource === 'VerificationCheck' && response.status === 404) {
        throw new BadRequestException('The code is invalid or has expired');
      }
      if (response.status === 400) {
        throw new BadRequestException(
          'The phone number could not be verified',
        );
      }
      throw new BadGatewayException(
        'Phone verification provider returned an error',
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new BadGatewayException(
        'Phone verification provider returned invalid JSON',
      );
    }

    if (!isRecord(payload) || typeof payload.status !== 'string') {
      throw new BadGatewayException(
        'Phone verification provider returned an invalid response',
      );
    }

    return payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
