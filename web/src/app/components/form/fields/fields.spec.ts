import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { type } from 'arktype';
import Fields from './fields';

const accountSchema = type({ email: 'string.email', password: '12 <= string <= 128' });

@Component({
  imports: [Fields],
  template: `
    <form-fields
      label="Email"
      hint="We never share it"
      type="email"
      placeholder="Ex. john-doe1932@example.com"
      autocomplete="email"
      [formField]="account.email"
    />
    <form-fields label="Password" type="password" autocomplete="new-password" [formField]="account.password" />
  `,
})
class AccountFormHost {
  readonly model = signal({ email: '', password: '' });
  readonly account = form(this.model, (path) => {
    // ArkType types are callable, so the schema goes wrapped in a function.
    validateStandardSchema(path, () => accountSchema);
  });
}

describe('Fields', () => {
  let fixture: ComponentFixture<AccountFormHost>;

  const element = () => fixture.nativeElement as HTMLElement;
  const field = (index: number) => element().querySelectorAll('mat-form-field')[index]!;
  const input = (index: number) => field(index).querySelector('input')!;
  const textOf = (index: number, selector: string) =>
    Array.from(field(index).querySelectorAll(selector)).map((node) => node.textContent?.trim());

  const type_ = async (index: number, value: string) => {
    input(index).value = value;
    input(index).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const leave = async (index: number) => {
    input(index).dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(AccountFormHost);
    await fixture.whenStable();
  });

  it('shows the label, the placeholder and the hint', () => {
    expect(textOf(0, 'mat-label')).toEqual(['Email']);
    expect(input(0).placeholder).toBe('Ex. john-doe1932@example.com');
    expect(textOf(0, 'mat-hint')).toEqual(['We never share it']);
  });

  it('leaves the hint out when there is none', () => {
    expect(textOf(1, 'mat-hint')).toEqual([]);
  });

  it('uses the given input type and autocomplete', () => {
    expect(input(0).type).toBe('email');
    expect(input(0).getAttribute('autocomplete')).toBe('email');
    expect(input(1).type).toBe('password');
    expect(input(1).getAttribute('autocomplete')).toBe('new-password');
  });

  it('writes what the user types into the form model', async () => {
    await type_(0, 'jane-doe@outlook.com');

    expect(fixture.componentInstance.model().email).toBe('jane-doe@outlook.com');
  });

  it('shows what the form model holds', async () => {
    fixture.componentInstance.model.set({ email: 'jane-doe@outlook.com', password: '' });
    await fixture.whenStable();

    expect(input(0).value).toBe('jane-doe@outlook.com');
  });

  it('does not show errors while the user is still in the field', async () => {
    await type_(0, 'asf');

    expect(textOf(0, 'mat-error')).toEqual([]);
    expect(field(0).classList).not.toContain('mat-form-field-invalid');
  });

  it('shows the errors in place of the hint once the user leaves the field', async () => {
    await type_(0, 'asf');
    await leave(0);

    expect(textOf(0, 'mat-error')).toEqual(['email must be an email address (was "asf")']);
    expect(textOf(0, 'mat-hint')).toEqual([]);
    expect(field(0).classList).toContain('mat-form-field-invalid');
    expect(input(0).getAttribute('aria-invalid')).toBe('true');
  });

  it('clears the errors once the value is valid', async () => {
    await type_(0, 'asf');
    await leave(0);
    await type_(0, 'jane-doe@outlook.com');

    expect(textOf(0, 'mat-error')).toEqual([]);
    expect(textOf(0, 'mat-hint')).toEqual(['We never share it']);
  });

  it('only shows the errors of its own field', async () => {
    await leave(0);
    await leave(1);

    expect(textOf(0, 'mat-error')).toEqual(['email must be an email address (was "")']);
    expect(textOf(1, 'mat-error')).toEqual(['password must be at least length 12']);
  });
});