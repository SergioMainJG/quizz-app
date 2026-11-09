import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { FormField, FormRoot, form, required } from "@angular/forms/signals";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import SubmitButton from "./submit-button";

const SUGGESTION = "Fill in your email first.";
const INVALID_MESSAGE = "Complete the form";
const VALID_MESSAGE = "Sign in";

/** The button as the pages use it: inside a Signal Forms form, following its validity. */
@Component({
  imports: [FormRoot, FormField, SubmitButton],
  template: `
    <form [formRoot]="signInForm">
      <input [formField]="signInForm.email" />
      <submit-button
        [isFormValid]="signInForm().valid()"
        suggestAboutForm="${SUGGESTION}"
        invalidMessage="${INVALID_MESSAGE}"
        validMessage="${VALID_MESSAGE}"
      />
    </form>
  `,
})
class Host {
  readonly send = vi.fn();
  readonly signInForm = form(signal({ email: "" }), (path) => required(path.email), {
    submission: { action: async () => this.send() },
  });
}

describe("SubmitButton", () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let button: MatButtonHarness;
  let nativeButton: HTMLButtonElement;

  const tooltip = () => TestbedHarnessEnvironment.loader(fixture).getHarness(MatTooltipHarness);

  const fillInEmail = async () => {
    host.signInForm.email().value.set("jane-doe@example.com");
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
    button = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatButtonHarness);
    nativeButton = fixture.nativeElement.querySelector("button");
  });

  it("is a submit button, so it submits the form it's in", async () => {
    await expect(button.getType()).resolves.toBe("submit");
  });

  describe("while the form is invalid", () => {
    it("shows the invalid message", async () => {
      await expect(button.getText()).resolves.toBe(INVALID_MESSAGE);
    });

    it("looks disabled, to sighted users and to assistive technology", async () => {
      await expect(button.isDisabled()).resolves.toBe(true);
      expect(nativeButton.getAttribute("aria-disabled")).toBe("true");
    });

    it("stays focusable, so keyboard users can reach the tooltip", () => {
      expect(nativeButton.hasAttribute("disabled")).toBe(false);

      nativeButton.focus();

      expect(document.activeElement).toBe(nativeButton);
    });

    it("explains what to fix in a tooltip", async () => {
      const hint = await tooltip();
      await hint.show();

      await expect(hint.isOpen()).resolves.toBe(true);
      await expect(hint.getTooltipText()).resolves.toBe(SUGGESTION);
    });

    it("doesn't send the form when clicked, but reveals what's wrong with it", async () => {
      await button.click();

      expect(host.send).not.toHaveBeenCalled();
      // Submitting marks every field as touched, which is when their errors show up.
      expect(host.signInForm.email().touched()).toBe(true);
      expect(host.signInForm.email().errors()).toEqual([expect.objectContaining({ kind: "required" })]);
    });
  });

  describe("while the form is valid", () => {
    beforeEach(fillInEmail);

    it("shows the valid message", async () => {
      await expect(button.getText()).resolves.toBe(VALID_MESSAGE);
    });

    it("is enabled", async () => {
      await expect(button.isDisabled()).resolves.toBe(false);
      expect(nativeButton.hasAttribute("aria-disabled")).toBe(false);
    });

    it("has no tooltip", async () => {
      const hint = await tooltip();
      await hint.show();

      await expect(hint.isOpen()).resolves.toBe(false);
    });

    it("sends the form when clicked", async () => {
      await button.click();

      expect(host.send).toHaveBeenCalledOnce();
    });
  });

  it("follows the form as it becomes valid and invalid again", async () => {
    await fillInEmail();
    await expect(button.getText()).resolves.toBe(VALID_MESSAGE);

    host.signInForm.email().value.set("");
    await fixture.whenStable();

    await expect(button.getText()).resolves.toBe(INVALID_MESSAGE);
    await expect(button.isDisabled()).resolves.toBe(true);
  });
});