import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import Image from './image';

describe('Image', () => {
  let fixture: ComponentFixture<Image>;

  const img = () => (fixture.nativeElement as HTMLElement).querySelector('img')!;

  const render = async (inputs: {
    imgSrc: string;
    altImg: string;
    isPriority?: boolean;
    fit?: 'cover' | 'contain';
    sizes?: string;
  }) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Image);
  });

  it('renders the image with its source and alt text', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: 'A quiz board' });

    expect(img().getAttribute('src')).toBe('/images/auth-background.jpg');
    expect(img().alt).toBe('A quiz board');
  });

  it('accepts an empty alt text for decorative images', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '' });

    expect(img().getAttribute('alt')).toBe('');
  });

  it('is a positioned box of its own, so the image fills it and nothing else', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '' });
    const host = fixture.nativeElement as HTMLElement;

    expect([...host.classList]).toEqual(expect.arrayContaining(['relative', 'block', 'overflow-hidden']));
    expect(img().style.position).toBe('absolute');
    expect(img().style.width).toBe('100%');
    expect(img().style.height).toBe('100%');
  });

  it('covers its box by default, cropping instead of distorting', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '' });

    expect(img().classList).toContain('object-cover');
    expect(img().classList).not.toContain('object-contain');
  });

  it('can show the whole image inside its box instead', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '', fit: 'contain' });

    expect(img().classList).toContain('object-contain');
    expect(img().classList).not.toContain('object-cover');
  });

  it('tells the browser how wide it is shown', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '', sizes: '(min-width: 64rem) 67vw, 100vw' });

    // Angular puts `auto` first on lazy images: the browser then uses the width it laid out.
    expect(img().getAttribute('sizes')).toMatch(/\(min-width: 64rem\) 67vw, 100vw$/);
  });

  it('loads lazily by default', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '' });

    expect(img().getAttribute('loading')).toBe('lazy');
  });

  it('loads right away with high priority when it is above the fold', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '', isPriority: true });

    expect(img().getAttribute('loading')).toBe('eager');
    expect(img().getAttribute('fetchpriority')).toBe('high');
  });
});

describe('Image inside a parent', () => {
  it('keeps the size classes its parent gives it', async () => {
    @Component({
      imports: [Image],
      template: `<app-image class="aspect-video w-full" imgSrc="/images/auth-background.jpg" altImg="" />`,
    })
    class Card {}

    const card = TestBed.createComponent(Card);
    await card.whenStable();
    const host = (card.nativeElement as HTMLElement).querySelector('app-image')!;

    expect([...host.classList]).toEqual(expect.arrayContaining(['aspect-video', 'w-full', 'relative']));
  });
});