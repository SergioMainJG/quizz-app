import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import AuthLayout, { type AuthPageData } from './auth.layout';

@Component({
  imports: [RouterLink],
  template: `<form aria-label="Sign in"><a routerLink="/auth/sign-up">Create an account</a></form>`,
})
class FakeSignIn {}

@Component({ template: `<form aria-label="Sign up"></form>` })
class FakeSignUp {}

// The layout is the parent route of the auth pages, like in app.routes.ts.
const routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'sign-in',
        component: FakeSignIn,
        data: { background: '/images/sign-in.avif', alt: '' } satisfies AuthPageData,
      },
      {
        path: 'sign-up',
        component: FakeSignUp,
        data: { background: '/images/sign-up.avif', alt: 'A quiz board' } satisfies AuthPageData,
      },
    ],
  },
];

describe('AuthLayout', () => {
  let harness: RouterTestingHarness;

  const element = () => harness.fixture.nativeElement as HTMLElement;
  const img = () => element().querySelector<HTMLImageElement>('aside img')!;

  const visit = async (url: string) => {
    await harness.navigateByUrl(url);
    await harness.fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
  });

  it('shows the active page inside the main landmark', async () => {
    await visit('/auth/sign-in');

    expect(element().querySelector('main form[aria-label="Sign in"]')).not.toBeNull();
  });

  it('puts the page before the image in the document order', async () => {
    await visit('/auth/sign-in');

    const main = element().querySelector('main')!;
    const aside = element().querySelector('aside')!;
    expect(main.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the background image and alt text the active page declares', async () => {
    await visit('/auth/sign-up');

    expect(img().getAttribute('src')).toBe('/images/sign-up.avif');
    expect(img().alt).toBe('A quiz board');
  });

  it('switches the background when the user moves to another auth page, keeping the layout', async () => {
    await visit('/auth/sign-in');
    const main = element().querySelector('main');
    expect(img().getAttribute('src')).toBe('/images/sign-in.avif');

    element().querySelector<HTMLAnchorElement>('a[href="/auth/sign-up"]')!.click();
    await vi.waitFor(async () => {
      await harness.fixture.whenStable();
      expect(element().querySelector('form[aria-label="Sign up"]')).not.toBeNull();
    });

    expect(img().getAttribute('src')).toBe('/images/sign-up.avif');
    expect(element().querySelector('main')).toBe(main);
  });

  it('loads the background image right away, with high priority', async () => {
    await visit('/auth/sign-in');

    expect(img().getAttribute('loading')).toBe('eager');
    expect(img().getAttribute('fetchpriority')).toBe('high');
  });

  it('hides the decorative image from assistive technologies', async () => {
    await visit('/auth/sign-in');

    expect(img().closest('aside')!.getAttribute('aria-hidden')).toBe('true');
  });
});