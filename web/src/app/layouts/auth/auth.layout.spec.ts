import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import AuthLayout from './auth.layout';

// The layout only makes sense with something projected into it, like the auth pages do.
@Component({
  imports: [AuthLayout],
  template: `
    <auth-layout [background]="background()" [alt]="alt()">
      <form aria-label="Sign up">
        <button type="submit">Sign up</button>
      </form>
    </auth-layout>
  `,
})
class AuthPageHost {
  readonly background = signal('/images/auth-background.jpg');
  readonly alt = signal('');
}

describe('AuthLayout', () => {
  let fixture: ComponentFixture<AuthPageHost>;

  const element = () => fixture.nativeElement as HTMLElement;
  const img = () => element().querySelector<HTMLImageElement>('aside img')!;

  const render = async (inputs: { background?: string; alt?: string } = {}) => {
    fixture = TestBed.createComponent(AuthPageHost);
    if (inputs.background !== undefined) fixture.componentInstance.background.set(inputs.background);
    if (inputs.alt !== undefined) fixture.componentInstance.alt.set(inputs.alt);
    await fixture.whenStable();
  };

  it('shows the projected content inside the main landmark', async () => {
    await render();

    const main = element().querySelector('main')!;
    expect(main.querySelector('form[aria-label="Sign up"]')).not.toBeNull();
  });

  it('puts the content before the image in the document order', async () => {
    await render();

    const main = element().querySelector('main')!;
    const aside = element().querySelector('aside')!;
    expect(main.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the background image with the given source and alt text', async () => {
    await render({ background: '/images/quiz-board.jpg', alt: 'A quiz board' });

    expect(img().getAttribute('src')).toBe('/images/quiz-board.jpg');
    expect(img().alt).toBe('A quiz board');
  });

  it('loads the background image right away, with high priority', async () => {
    await render();

    expect(img().getAttribute('loading')).toBe('eager');
    expect(img().getAttribute('fetchpriority')).toBe('high');
  });

  it('hides the decorative image from assistive technologies', async () => {
    await render();

    expect(img().closest('aside')!.getAttribute('aria-hidden')).toBe('true');
  });
});