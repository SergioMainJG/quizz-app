import { type ComponentFixture, TestBed } from '@angular/core/testing';
import Image from './image';

describe('Image', () => {
  let fixture: ComponentFixture<Image>;

  const img = () => (fixture.nativeElement as HTMLElement).querySelector('img')!;

  const render = async (inputs: { imgSrc: string; altImg: string; isPriority?: boolean }) => {
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

  it('fills its positioned container and covers it without distortion', async () => {
    await render({ imgSrc: '/images/auth-background.jpg', altImg: '' });

    expect(img().style.position).toBe('absolute');
    expect(img().style.width).toBe('100%');
    expect(img().style.height).toBe('100%');
    expect(img().classList).toContain('object-cover');
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