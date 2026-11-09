import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import AuthManagement from './auth-management';

const SIGN_UP_ROUTE = '/api/auth/sign-up';
const SIGN_IN_ROUTE = '/api/auth/sign-in';

const user = {
  id: '5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f',
  username: 'jose',
  email: 'jose@example.com',
  role: 'PLAYER',
  // Dates arrive as ISO strings in JSON.
  createdAt: '2026-11-04T00:00:00.000Z',
} as const;

const signUpRequest = {
  username: 'jose',
  email: 'jose@example.com',
  password: 'correct horse battery staple',
};

const signInRequest = {
  email: signUpRequest.email,
  password: signUpRequest.password,
};

// Error body shape of Nest's built-in HTTP exceptions.
const nestError = (statusCode: number, error: string, message: string) => ({ statusCode, error, message });

describe('AuthManagement', () => {
  let service: AuthManagement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthManagement);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // No unexpected or unanswered requests.
    httpTesting.verify();
  });

  describe('signUp', () => {
    it('posts username, email and password to the sign-up endpoint', async () => {
      const result = firstValueFrom(service.signUp(signUpRequest));

      const req = httpTesting.expectOne({ method: 'POST', url: SIGN_UP_ROUTE });
      expect(req.request.body).toEqual(signUpRequest);
      req.flush(user, { status: 201, statusText: 'Created' });

      await expect(result).resolves.toEqual(user);
    });

    it('fails with 409 when the email or username is already taken', async () => {
      const result = firstValueFrom(service.signUp(signUpRequest));

      httpTesting
        .expectOne({ method: 'POST', url: SIGN_UP_ROUTE })
        .flush(nestError(409, 'Conflict', 'Email already registered'), { status: 409, statusText: 'Conflict' });

      await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
      await expect(result).rejects.toMatchObject({ status: 409 });
    });

    it('fails with 400 when the body does not pass validation', async () => {
      const result = firstValueFrom(service.signUp({ ...signUpRequest, email: 'not-an-email' }));

      httpTesting
        .expectOne({ method: 'POST', url: SIGN_UP_ROUTE })
        .flush(nestError(400, 'Bad Request', 'email must be an email address'), {
          status: 400,
          statusText: 'Bad Request',
        });

      await expect(result).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('signIn', () => {
    it('posts email and password to the sign-in endpoint', async () => {
      const result = firstValueFrom(service.signIn(signInRequest));

      const req = httpTesting.expectOne({ method: 'POST', url: SIGN_IN_ROUTE });
      expect(req.request.body).toEqual(signInRequest);
      req.flush({ mfaRequired: false });

      await expect(result).resolves.toEqual({ mfaRequired: false });
    });

    it('reports mfaRequired when the account needs a second factor', async () => {
      const result = firstValueFrom(service.signIn(signInRequest));

      httpTesting.expectOne({ method: 'POST', url: SIGN_IN_ROUTE }).flush({ mfaRequired: true });

      await expect(result).resolves.toEqual({ mfaRequired: true });
    });

    it('fails with 401 when the credentials are wrong', async () => {
      const result = firstValueFrom(service.signIn({ ...signInRequest, password: 'wrong password' }));

      httpTesting
        .expectOne({ method: 'POST', url: SIGN_IN_ROUTE })
        .flush(nestError(401, 'Unauthorized', 'Invalid email or password'), {
          status: 401,
          statusText: 'Unauthorized',
        });

      await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
      await expect(result).rejects.toMatchObject({ status: 401 });
    });
  });
});